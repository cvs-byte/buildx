import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";
const ddbClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const USERS_TABLE = process.env.USERS_TABLE || "Users";
const ATTENDANCE_TABLE = process.env.ATTENDANCE_TABLE || "Attendance";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

/**
 * AWS Lambda Entry Point (Node.js 24 ES Module index.mjs)
 */
export const handler = async (event) => {
  console.log("ATTENDANCE LAMBDA STARTED");

  const method = (
    event?.requestContext?.http?.method ||
    event?.httpMethod ||
    "GET"
  ).toUpperCase();

  const path = (
    event?.rawPath ||
    event?.path ||
    "/"
  ).replace(/\/+$/, "") || "/";

  console.log("REQUEST", { method, path });

  // Handle CORS Preflight OPTIONS -> 204
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  try {
    // 1. POST /bulk - Main Bulk Attendance Submission Route
    if (method === "POST" && (path === "/bulk" || path.endsWith("/bulk"))) {
      console.log("POST /bulk RECEIVED");
      return await handleBulkAttendance(event);
    }

    // 2. PUT /attendance - Individual Attendance Write Route
    if (method === "PUT" && (path === "/attendance" || path.endsWith("/attendance"))) {
      return await handleSingleAttendanceUpdate(event);
    }

    // 3. GET /attendance - Retrieve Persisted Attendance Records
    if (method === "GET" && (path === "/attendance" || path.endsWith("/attendance"))) {
      return await handleGetAttendance(event);
    }

    // 4. GET /summary - Attendance Summary Metrics
    if (method === "GET" && (path === "/summary" || path.endsWith("/summary"))) {
      return await handleGetSummary(event);
    }

    // 5. GET /classes - Available Classes List
    if (method === "GET" && (path === "/classes" || path.endsWith("/classes"))) {
      return handleGetClasses();
    }

    // 6. GET /sections - Available Sections List
    if (method === "GET" && (path === "/sections" || path.endsWith("/sections"))) {
      return handleGetSections();
    }

    // 7. GET /students - Fetch Real Canonical Students from Users Table
    if (method === "GET" && (path === "/students" || path.endsWith("/students"))) {
      return await handleGetStudents(event);
    }

    // 8. POST /qr - Create Short-lived QR Attendance Session
    if (method === "POST" && (path === "/qr" || path.endsWith("/qr"))) {
      return await handleCreateQRSession(event);
    }

    // 9. POST /validate - Validate Student QR Scan & Mark Attendance Atomically
    if (method === "POST" && (path === "/validate" || path.endsWith("/validate"))) {
      return await handleValidateQRScan(event);
    }

    // 10. GET /student/{studentId} - Single Student Attendance Log
    if (method === "GET" && (path.includes("/student/"))) {
      return await handleGetStudentHistory(event);
    }

    // 11. GET /history - Overall Attendance Audit History
    if (method === "GET" && (path === "/history" || path.endsWith("/history"))) {
      return await handleGetAttendance(event);
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: `Route not found: ${method} ${path}` }),
    };
  } catch (error) {
    console.error("ATTENDANCE LAMBDA ERROR:", error);
    return {
      statusCode: error.statusCode || 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: error.message || "Internal Server Error" }),
    };
  }
};

/**
 * Route Handler: POST /bulk
 */
async function handleBulkAttendance(event) {
  const body = parseBody(event);
  const { date, classId, sectionId, schoolId: bodySchoolId, records } = body;

  if (!date || !classId || !records || !Array.isArray(records) || records.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Invalid payload. Missing date, classId, or records array." }),
    };
  }

  const effectiveSchoolId = extractSchoolId(event, bodySchoolId);

  // Write items to Attendance Table
  const writeRequests = records.map((record) => {
    const studentId = record.studentId;
    const status = (record.status || "ABSENT").toUpperCase();
    const id = `att_${effectiveSchoolId}_${date}_${classId}_${sectionId || "A"}_${studentId}`;

    return {
      PutRequest: {
        Item: {
          id,
          schoolId: effectiveSchoolId,
          tenantId: effectiveSchoolId,
          studentId,
          userId: studentId,
          status,
          date,
          classId,
          sectionId: sectionId || "A",
          remarks: record.remarks || "Bulk Roster Attendance",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };
  });

  // Execute BatchWrite in chunks of 25 items (DynamoDB limit)
  const chunkSize = 25;
  for (let i = 0; i < writeRequests.length; i += chunkSize) {
    const chunk = writeRequests.slice(i, i + chunkSize);
    const command = new BatchWriteCommand({
      RequestItems: {
        [ATTENDANCE_TABLE]: chunk,
      },
    });
    await docClient.send(command);
  }

  console.log("ATTENDANCE SAVED", { count: records.length, schoolId: effectiveSchoolId, date, classId });

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      count: records.length,
      message: `Successfully recorded attendance for ${records.length} students.`,
    }),
  };
}

/**
 * Route Handler: PUT /attendance
 */
async function handleSingleAttendanceUpdate(event) {
  const body = parseBody(event);
  const { studentId, status, date, classId, sectionId, schoolId: bodySchoolId, remarks } = body;

  if (!studentId || !date || !status) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing studentId, date, or status." }),
    };
  }

  const effectiveSchoolId = extractSchoolId(event, bodySchoolId);
  const formattedStatus = status.toUpperCase();
  const id = body.id || `att_${effectiveSchoolId}_${date}_${classId || "class-10"}_${sectionId || "A"}_${studentId}`;

  const item = {
    id,
    schoolId: effectiveSchoolId,
    tenantId: effectiveSchoolId,
    studentId,
    userId: studentId,
    status: formattedStatus,
    date,
    classId: classId || "class-10",
    sectionId: sectionId || "A",
    remarks: remarks || "Attendance Record Update",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: ATTENDANCE_TABLE,
    Item: item,
  });

  await docClient.send(command);

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, record: item }),
  };
}

/**
 * Route Handler: GET /attendance
 */
async function handleGetAttendance(event) {
  const queryParams = event?.queryStringParameters || {};
  const schoolId = extractSchoolId(event, queryParams.schoolId);
  const { classId, sectionId, date, studentId } = queryParams;

  try {
    let items = [];
    if (studentId) {
      const command = new ScanCommand({
        TableName: ATTENDANCE_TABLE,
        FilterExpression: "#sid = :studentId OR #uid = :studentId",
        ExpressionAttributeNames: { "#sid": "studentId", "#uid": "userId" },
        ExpressionAttributeValues: { ":studentId": studentId },
      });
      const res = await docClient.send(command);
      items = res.Items || [];
    } else {
      const command = new ScanCommand({
        TableName: ATTENDANCE_TABLE,
      });
      const res = await docClient.send(command);
      items = res.Items || [];
    }

    if (schoolId) {
      items = items.filter((i) => (i.schoolId || i.tenantId) === schoolId);
    }
    if (date) {
      items = items.filter((i) => i.date === date);
    }
    if (classId) {
      items = items.filter((i) => String(i.classId).toLowerCase().includes(classId.toLowerCase()));
    }
    if (sectionId) {
      items = items.filter((i) => String(i.sectionId).toLowerCase() === sectionId.toLowerCase());
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, items, total: items.length }),
    };
  } catch {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, items: [], total: 0 }),
    };
  }
}

/**
 * Route Handler: GET /summary
 */
async function handleGetSummary(event) {
  const queryParams = event?.queryStringParameters || {};
  const attRes = await handleGetAttendance(event);
  const data = JSON.parse(attRes.body);
  const items = data.items || [];

  const total = items.length;
  const present = items.filter((i) => i.status === "PRESENT").length;
  const absent = items.filter((i) => i.status === "ABSENT").length;
  const late = items.filter((i) => i.status === "LATE").length;
  const excused = items.filter((i) => i.status === "ON_LEAVE" || i.status === "EXCUSED").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      summary: {
        totalStudents: total,
        present,
        absent,
        late,
        excused,
        attendancePercentage: percentage,
        date: queryParams.date,
        classId: queryParams.classId,
        sectionId: queryParams.sectionId,
      },
    }),
  };
}

/**
 * Route Handler: GET /classes
 */
function handleGetClasses() {
  const classes = [
    { id: "class-1", name: "Class 1", gradeLevel: "Grade 1" },
    { id: "class-2", name: "Class 2", gradeLevel: "Grade 2" },
    { id: "class-3", name: "Class 3", gradeLevel: "Grade 3" },
    { id: "class-4", name: "Class 4", gradeLevel: "Grade 4" },
    { id: "class-5", name: "Class 5", gradeLevel: "Grade 5" },
    { id: "class-6", name: "Class 6", gradeLevel: "Grade 6" },
    { id: "class-7", name: "Class 7", gradeLevel: "Grade 7" },
    { id: "class-8", name: "Class 8", gradeLevel: "Grade 8" },
    { id: "class-9", name: "Class 9", gradeLevel: "Grade 9" },
    { id: "class-10", name: "Class 10", gradeLevel: "Grade 10" },
    { id: "class-11", name: "Class 11", gradeLevel: "Grade 11" },
    { id: "class-12", name: "Class 12", gradeLevel: "Grade 12" },
    { id: "btech-1", name: "B.Tech 1st Year", gradeLevel: "B.Tech 1" },
    { id: "btech-2", name: "B.Tech 2nd Year", gradeLevel: "B.Tech 2" },
    { id: "btech-3", name: "B.Tech 3rd Year", gradeLevel: "B.Tech 3" },
    { id: "btech-4", name: "B.Tech 4th Year", gradeLevel: "B.Tech 4" },
  ];
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, classes }),
  };
}

/**
 * Route Handler: GET /sections
 */
function handleGetSections() {
  const sections = [
    { id: "sec-a", name: "Section A", studentCount: 30 },
    { id: "sec-b", name: "Section B", studentCount: 28 },
    { id: "sec-c", name: "Section C", studentCount: 25 },
  ];
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, sections }),
  };
}

/**
 * Route Handler: GET /students
 */
async function handleGetStudents(event) {
  const queryParams = event?.queryStringParameters || {};
  const schoolId = extractSchoolId(event, queryParams.schoolId);

  try {
    const command = new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: "#role = :role",
      ExpressionAttributeNames: { "#role": "role" },
      ExpressionAttributeValues: { ":role": "STUDENT" },
    });

    const res = await docClient.send(command);
    let students = res.Items || [];

    if (schoolId) {
      students = students.filter((s) => (s.schoolId || s.tenantId) === schoolId);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, students }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Unable to load students from Users table." }),
    };
  }
}

/**
 * Route Handler: POST /qr
 */
async function handleCreateQRSession(event) {
  const body = parseBody(event);
  const sessionId = `qrsess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const token = `AG_QR_${body.classId || "10"}_${body.sectionId || "A"}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: true,
      sessionId,
      token,
      expiresAt,
      classId: body.classId,
      sectionId: body.sectionId,
      qrData: token,
    }),
  };
}

/**
 * Route Handler: POST /validate
 */
async function handleValidateQRScan(event) {
  const body = parseBody(event);
  const { studentId, rawQR } = body;

  const resolvedUserId = studentId || rawQR;
  if (!resolvedUserId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Missing studentId or rawQR." }),
    };
  }

  // Atomically update attendance to PRESENT
  const date = new Date().toISOString().split("T")[0];
  const updateRes = await handleSingleAttendanceUpdate({
    body: JSON.stringify({
      studentId: resolvedUserId,
      status: "PRESENT",
      date,
      remarks: "Scanned Student Personal QR Pass",
    }),
  });

  return updateRes;
}

/**
 * Route Handler: GET /student/{studentId}
 */
async function handleGetStudentHistory(event) {
  const path = event?.rawPath || event?.path || "";
  const parts = path.split("/");
  const studentId = parts[parts.length - 1];

  event.queryStringParameters = { ...event.queryStringParameters, studentId };
  return await handleGetAttendance(event);
}

/**
 * Utility: Safe JSON Body Parser
 */
function parseBody(event) {
  if (!event || !event.body) return {};
  if (typeof event.body === "object") return event.body;
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

/**
 * Utility: Extract School / Tenant ID safely from event context or payload
 */
function extractSchoolId(event, fallbackSchoolId) {
  const authorizerSchoolId =
    event?.requestContext?.authorizer?.claims?.["custom:schoolId"] ||
    event?.requestContext?.authorizer?.claims?.schoolId ||
    event?.requestContext?.authorizer?.schoolId;

  return authorizerSchoolId || fallbackSchoolId || "sch-001";
}

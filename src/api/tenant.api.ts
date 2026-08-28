import type { Tenant, CreateTenantDTO } from '../types/tenant.types';
import { userApi } from './user.api';

/**
 * Tenant Service - Derives school entries dynamically from real Users DynamoDB records.
 * There is NO separate Schools table or /Schools endpoint in this architecture.
 */
export const tenantApi = {
  /**
   * Fetch distinct schools from real Users database records
   */
  async getTenants(): Promise<Tenant[]> {
    try {
      const users = await userApi.getAllUsers();
      const schoolMap = new Map<string, { id: string; name: string; userCount: number }>();

      for (const u of users) {
        if (u.schoolId) {
          const sId = u.schoolId;
          const sName = u.schoolName || `School ${sId}`;
          const existing = schoolMap.get(sId);
          if (existing) {
            existing.userCount += 1;
          } else {
            schoolMap.set(sId, { id: sId, name: sName, userCount: 1 });
          }
        }
      }

      return Array.from(schoolMap.values()).map((s) => ({
        id: s.id,
        name: s.name,
        code: s.id,
        contactEmail: '',
        status: 'ACTIVE',
        principalCount: users.filter((u) => u.schoolId === s.id && u.role === 'PRINCIPAL').length,
        teacherCount: users.filter((u) => u.schoolId === s.id && u.role === 'TEACHER').length,
        studentCount: users.filter((u) => u.schoolId === s.id && u.role === 'STUDENT').length,
        createdAt: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async getTenantById(id: string): Promise<Tenant> {
    const tenants = await this.getTenants();
    const found = tenants.find((t) => t.id === id);
    if (!found) {
      throw new Error('School not found.');
    }
    return found;
  },

  async createTenant(_data: CreateTenantDTO): Promise<Tenant> {
    throw new Error('Schools cannot be created standalone. Please create a Principal to register a new school.');
  },
};

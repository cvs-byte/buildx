import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { timetableApi } from '../../api/timetable.api';
import { useToast } from '../../hooks/useToast';
import { useTenant } from '../../hooks/useTenant';
import type { DayOfWeek } from '../../types/timetable.types';

export interface CreateTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateTimetableModal: React.FC<CreateTimetableModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activeTenant } = useTenant();
  const { showToast } = useToast();

  const [teacherId, setTeacherId] = useState('tch_201');
  const [teacherName, setTeacherName] = useState('Eleanor Vance');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [subjectCode, setSubjectCode] = useState('CS101');
  const [className, setClassName] = useState('Class A - CS');
  const [roomNumber, setRoomNumber] = useState('Lab 302');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await timetableApi.createTimetableEntry({
        teacherId,
        teacherName,
        subject,
        subjectCode,
        className,
        roomNumber,
        dayOfWeek,
        startTime,
        endTime,
        tenantId: activeTenant?.id || 'tenant_oxford_101',
      });

      showToast('success', `Timetable entry for ${teacherName} scheduled successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to schedule timetable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const teacherOptions = [
    { value: 'tch_201', label: 'Prof. Eleanor Vance (Computer Science)' },
    { value: 'tch_202', label: 'Prof. Robert Langdon (Mathematics)' },
    { value: 'tch_203', label: 'Dr. Alan Turing (Computer Science)' },
  ];

  const dayOptions = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Teacher Timetable"
      subtitle="Assign classroom, subject, day, and time slots to faculty members."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="ag-form-stack">
        <Select
          label="Select Faculty Teacher"
          options={teacherOptions}
          value={teacherId}
          onChange={(e) => {
            setTeacherId(e.target.value);
            const found = teacherOptions.find((t) => t.value === e.target.value);
            if (found) setTeacherName(found.label.split('(')[0].trim());
          }}
          required
        />

        <div className="ag-form-row">
          <Input
            label="Subject Title"
            placeholder="e.g. Data Structures & Algorithms"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. CS101"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div className="ag-form-row">
          <Input
            label="Class Group / Section"
            placeholder="e.g. Class A - CS"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <Input
            label="Classroom / Lab Number"
            placeholder="e.g. Lab 302"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
        </div>

        <div className="ag-form-row">
          <Select
            label="Day of Week"
            options={dayOptions}
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
          />
          <div className="ag-form-row">
            <Input
              label="Start Time"
              placeholder="09:00 AM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              placeholder="10:30 AM"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="ag-modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Confirm Timetable Slot
          </Button>
        </div>
      </form>
    </Modal>
  );
};

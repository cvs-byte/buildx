import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { classGroupApi } from '../../api/classGroup.api';
import { useToast } from '../../hooks/useToast';
import { useTenant } from '../../hooks/useTenant';

export interface CreateClassGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateClassGroupModal: React.FC<CreateClassGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activeTenant } = useTenant();
  const { showToast } = useToast();

  const [name, setName] = useState('Class A - Computer Science');
  const [code, setCode] = useState('CLS-A-CS');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [gradeLevel, setGradeLevel] = useState('Grade 11');
  const [section, setSection] = useState('Section A');
  const [capacity, setCapacity] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await classGroupApi.createClassGroup({
        name,
        code,
        academicYear,
        gradeLevel,
        section,
        capacity,
        tenantId: activeTenant?.id || 'tenant_oxford_101',
      });

      showToast('success', `Class group ${name} created successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create class group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Organize New Student Class Group"
      subtitle="Group students into Class A, Class B, Grade levels, and sections for timetables and attendance."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="ag-form-stack">
        <Input
          label="Class Group Name"
          placeholder="e.g. Class A - Computer Science"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="ag-form-row">
          <Input
            label="Class Identifier Code"
            placeholder="e.g. CLS-A-CS"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <Input
            label="Academic Year"
            placeholder="2026-2027"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
          />
        </div>

        <div className="ag-form-row">
          <Input
            label="Grade Level"
            placeholder="e.g. Grade 11"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            required
          />
          <Input
            label="Section / Batch"
            placeholder="e.g. Section A"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          />
        </div>

        <Input
          label="Maximum Student Capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
          required
        />

        <div className="ag-modal-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Class Group
          </Button>
        </div>
      </form>
    </Modal>
  );
};

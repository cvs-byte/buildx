import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { tenantApi } from '../../api/tenant.api';
import { useToast } from '../../hooks/useToast';
import { useTenant } from '../../hooks/useTenant';

export interface CreateTenantFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateTenantForm: React.FC<CreateTenantFormProps> = ({ onSuccess, onCancel }) => {
  const { addTenant } = useTenant();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [domain, setDomain] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'School / College name is required.';
    if (!code.trim()) errs.code = 'Tenant code is required.';
    if (!contactEmail.trim()) errs.contactEmail = 'Contact email is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const newTenant = await tenantApi.createTenant({
        name,
        code,
        contactEmail,
        phone,
        domain,
      });

      addTenant(newTenant);
      showToast('success', `School tenant ${newTenant.name} created successfully!`);
      onSuccess();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create tenant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ag-form-stack">
      <Input
        label="School / Institution Name"
        placeholder="e.g. Cambridge Academy of Science"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <div className="ag-form-row">
        <Input
          label="Tenant Identifier Code"
          placeholder="e.g. CAS-MAIN"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          error={errors.code}
          helperText="Unique code for login scope identification"
          required
        />
        <Input
          label="Custom Domain (Optional)"
          placeholder="e.g. cambridge.academygrowth.in"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
      </div>

      <div className="ag-form-row">
        <Input
          label="Contact Email"
          type="email"
          placeholder="admin@cambridge.edu"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          error={errors.contactEmail}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 555 8822"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="ag-modal-actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create School Tenant
        </Button>
      </div>
    </form>
  );
};

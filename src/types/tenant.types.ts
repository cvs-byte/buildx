export interface Tenant {
  id: string;
  name: string;
  code: string; // Unique shortcode e.g. "OXFORD", "HARVARD"
  domain?: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
  principalCount?: number;
  teacherCount?: number;
  studentCount?: number;
  createdAt: string;
}

export interface CreateTenantDTO {
  name: string;
  code: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  domain?: string;
}

export interface UpdateTenantDTO extends Partial<CreateTenantDTO> {
  status?: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
}

export type OfficerType = {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  gender?: string;
  email: string;
  role: string;
  departmentId?: string;
  departmentName?: string;
  treasurerType?: "department_treasurer" | "main_treasurer" | "";
  createdAt?: string;
  profilePictureUrl?: string;
};

export type CreateOfficerData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  gender: string;
  email: string;
  password: string;
  role: string;
  departmentId?: string;
};

export type OfficerStoreType = {
  officers: OfficerType[];
  loading: boolean;
  error: string | null;

  fetchOfficers: () => Promise<void>;
  createOfficer: (data: CreateOfficerData) => Promise<boolean>;
  deleteOfficer: (officerId: string) => Promise<boolean>;
  setOfficers: (officers: OfficerType[]) => void;
  clearError: () => void;
};



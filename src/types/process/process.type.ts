export type InspectionDepartmentType = {
  id: string;
  name: string;
  sequence: number;
};

export type InspectionProcessType = {
  _id: string;
  key: "inspection_process";
  name: string;
  departments: InspectionDepartmentType[];
  createdAt?: string;
  updatedAt?: string;
};

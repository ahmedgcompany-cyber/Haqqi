export type Country = "UAE" | "Saudi Arabia" | "Kuwait" | "Qatar" | "Bahrain" | "Oman";

export type Currency = "AED" | "SAR" | "KWD" | "QAR" | "BHD" | "OMR";

export type ContractType = "limited" | "unlimited";

export type TerminationReason =
  | "employer_termination"
  | "employee_resignation"
  | "end_of_contract"
  | "mutual_agreement";

export type SubscriptionTier = "free" | "growth" | "scale";

export type Company = {
  id: string;
  userId: string;
  name: string;
  tradeLicense: string;
  country: Country;
  bankCode: string;
  wpsEstablishmentId: string;
  email: string;
  contactName: string;
  createdAt?: string;
};

export type Employee = {
  id: string;
  companyId: string;
  userId: string;
  name: string;
  nationality: string;
  salary: number;
  basicSalary: number;
  startDate: string;
  contractType: ContractType;
  country: Country;
  iban: string;
  employeeNumber: string;
  status: "active" | "notice" | "terminated";
  unusedLeaveDays: number;
  createdAt?: string;
};

export type AuditEvent = {
  id: string;
  userId: string;
  actor: string;
  action: string;
  entity: string;
  createdAt: string;
};

export type GratuityInput = {
  country: Country;
  contractType: ContractType;
  terminationReason: TerminationReason;
  monthlySalary: number;
  basicSalary: number;
  yearsOfService: number;
  currency?: Currency;
};

export type GratuityResult = {
  amount: number;
  dailyRate: number;
  explanation: string[];
  eligible: boolean;
  legalReference: string;
};

export type SettlementInput = GratuityInput & {
  unusedLeaveDays: number;
  noticeDays: number;
  pendingSalaryDays: number;
  deductions: number;
};

export type SettlementResult = {
  gratuity: number;
  leaveEncashment: number;
  noticePay: number;
  pendingSalary: number;
  deductions: number;
  total: number;
};
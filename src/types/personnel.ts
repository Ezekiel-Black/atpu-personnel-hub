export type PersonnelCategory = 'civilian' | 'police' | 'student';

export type PoliceRank = 
  | 'PC' 
  | 'CPL' 
  | 'SGT' 
  | 'S/SGT' 
  | 'IP'
  | 'CI'
  | 'ASP'
  | 'SP'
  | 'SSP'
  | 'ACP'
  | 'CP';

export type PersonnelStatus = 'active' | 'attachment_ended' | 'inactive';

export type RefereeType = 'atpu_staff' | 'former_student' | 'non_atpu_officer';

export type EmploymentStatus = 'employed' | 'unemployed' | 'student';

export type ServiceBody = 'AP' | 'GSU' | 'Kenya Police Service' | 'Other';

export interface BasePersonnel {
  id: string;
  category: PersonnelCategory;
  fullName: string;
  phoneNumbers: string[];
  email: string;
  nationalId: string;
  status: PersonnelStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliceOfficer extends BasePersonnel {
  category: 'police';
  rank: PoliceRank;
  forceNumber: string;
  title?: string;
  department: string;
}

export interface CivilianStaff extends BasePersonnel {
  category: 'civilian';
  jobTitle: string;
  department: string;
}

// Referee types
export interface BaseReferee {
  id: string;
  refereeType: RefereeType;
  fullName: string;
  phoneNumbers: string[];
  email: string;
  nationalId: string;
}

export interface AtpuStaffReferee extends BaseReferee {
  refereeType: 'atpu_staff';
  personnelCategory: 'civilian' | 'police';
  // For police officers
  rank?: PoliceRank;
  forceNumber?: string;
  department: string;
  // For civilian staff
  jobTitle?: string;
  // Reference to existing personnel record if selected
  linkedPersonnelId?: string;
}

export interface FormerStudentReferee extends BaseReferee {
  refereeType: 'former_student';
  formerOfficeAttachedTo: string;
  employmentStatus: EmploymentStatus;
  // If employed
  placeOfEmployment?: string;
  employerPhone?: string;
  employerEmail?: string;
  employmentConfirmationPerson?: string;
}

export interface NonAtpuOfficerReferee extends BaseReferee {
  refereeType: 'non_atpu_officer';
  rank: PoliceRank;
  forceNumber: string;
  serviceBody: ServiceBody;
  serviceBodyOther?: string;
}

export type Referee = AtpuStaffReferee | FormerStudentReferee | NonAtpuOfficerReferee;

export interface StudentAttachee extends BasePersonnel {
  category: 'student';
  attachmentStartDate: Date;
  attachmentDurationWeeks: number;
  attachmentEndDate: Date;
  officeAttachedTo: string;
  referee: Referee;
}

export type Personnel = PoliceOfficer | CivilianStaff | StudentAttachee;

export interface PersonnelStats {
  total: number;
  civilians: number;
  policeOfficers: number;
  students: number;
  activeStudents: number;
  rankBreakdown: Record<PoliceRank, number>;
}

export type UserRole = 'viewer' | 'officer_in_charge';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

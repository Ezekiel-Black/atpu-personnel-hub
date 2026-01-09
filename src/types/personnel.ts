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

export interface StudentAttachee extends BasePersonnel {
  category: 'student';
  attachmentStartDate: Date;
  attachmentDurationWeeks: number;
  attachmentEndDate: Date;
  officeAttachedTo: string;
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

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Personnel, PersonnelStats, User, PoliceRank, StudentAttachee } from '@/types/personnel';
import { addWeeks, isBefore } from 'date-fns';

interface PersonnelContextType {
  personnel: Personnel[];
  stats: PersonnelStats;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  searchPersonnel: (query: string) => Personnel[];
  canEdit: boolean;
  canDelete: boolean;
}

const PersonnelContext = createContext<PersonnelContextType | undefined>(undefined);

// Sample data for demonstration
const samplePersonnel: Personnel[] = [
  {
    id: '1',
    category: 'police',
    fullName: 'John Kamau Mwangi',
    phoneNumbers: ['+254 712 345 678'],
    email: 'j.kamau@atpu.go.ke',
    nationalId: '12345678',
    status: 'active',
    rank: 'Inspector',
    forceNumber: 'AP-2019-0451',
    title: 'Senior Operations Officer',
    department: 'Operations',
    createdAt: new Date('2019-03-15'),
    updatedAt: new Date('2024-01-10'),
  } as Personnel,
  {
    id: '2',
    category: 'police',
    fullName: 'Grace Wanjiku Njoroge',
    phoneNumbers: ['+254 723 456 789'],
    email: 'g.wanjiku@atpu.go.ke',
    nationalId: '23456789',
    status: 'active',
    rank: 'Sergeant',
    forceNumber: 'AP-2020-0892',
    department: 'Intelligence',
    createdAt: new Date('2020-06-20'),
    updatedAt: new Date('2024-02-15'),
  } as Personnel,
  {
    id: '3',
    category: 'police',
    fullName: 'Peter Ochieng Otieno',
    phoneNumbers: ['+254 734 567 890'],
    email: 'p.ochieng@atpu.go.ke',
    nationalId: '34567890',
    status: 'active',
    rank: 'PC',
    forceNumber: 'AP-2022-1234',
    department: 'Field Operations',
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2024-03-01'),
  } as Personnel,
  {
    id: '4',
    category: 'civilian',
    fullName: 'Mary Akinyi Oloo',
    phoneNumbers: ['+254 745 678 901'],
    email: 'm.akinyi@atpu.go.ke',
    nationalId: '45678901',
    status: 'active',
    jobTitle: 'Administrative Officer',
    department: 'Administration',
    createdAt: new Date('2018-09-05'),
    updatedAt: new Date('2024-01-20'),
  } as Personnel,
  {
    id: '5',
    category: 'civilian',
    fullName: 'James Kipchoge Korir',
    phoneNumbers: ['+254 756 789 012'],
    email: 'j.kipchoge@atpu.go.ke',
    nationalId: '56789012',
    status: 'active',
    jobTitle: 'IT Specialist',
    department: 'ICT',
    createdAt: new Date('2021-04-12'),
    updatedAt: new Date('2024-02-28'),
  } as Personnel,
  {
    id: '6',
    category: 'student',
    fullName: 'Faith Nyambura Wambui',
    phoneNumbers: ['+254 767 890 123'],
    email: 'f.nyambura@university.ac.ke',
    nationalId: '67890123',
    status: 'active',
    attachmentStartDate: new Date('2024-01-08'),
    attachmentDurationWeeks: 12,
    attachmentEndDate: addWeeks(new Date('2024-01-08'), 12),
    officeAttachedTo: 'ICT Department',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  } as Personnel,
  {
    id: '7',
    category: 'student',
    fullName: 'Brian Otieno Odhiambo',
    phoneNumbers: ['+254 778 901 234'],
    email: 'b.otieno@university.ac.ke',
    nationalId: '78901234',
    status: 'active',
    attachmentStartDate: new Date('2024-02-01'),
    attachmentDurationWeeks: 8,
    attachmentEndDate: addWeeks(new Date('2024-02-01'), 8),
    officeAttachedTo: 'Records Office',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  } as Personnel,
  {
    id: '8',
    category: 'police',
    fullName: 'Samuel Muthoni Kariuki',
    phoneNumbers: ['+254 789 012 345'],
    email: 's.muthoni@atpu.go.ke',
    nationalId: '89012345',
    status: 'active',
    rank: 'Corporal',
    forceNumber: 'AP-2021-0567',
    department: 'Logistics',
    createdAt: new Date('2021-08-15'),
    updatedAt: new Date('2024-01-05'),
  } as Personnel,
  {
    id: '9',
    category: 'police',
    fullName: 'Elizabeth Chebet Kiplagat',
    phoneNumbers: ['+254 790 123 456'],
    email: 'e.chebet@atpu.go.ke',
    nationalId: '90123456',
    status: 'active',
    rank: 'Senior Sergeant',
    forceNumber: 'AP-2017-0234',
    department: 'Training',
    createdAt: new Date('2017-05-20'),
    updatedAt: new Date('2024-02-10'),
  } as Personnel,
];

const defaultUser: User = {
  id: '1',
  name: 'Demo User',
  role: 'viewer',
};

export function PersonnelProvider({ children }: { children: ReactNode }) {
  const [personnel, setPersonnel] = useState<Personnel[]>(samplePersonnel);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  // Check and update student attachment status
  useEffect(() => {
    const checkAttachments = () => {
      const now = new Date();
      setPersonnel(prev => 
        prev.map(person => {
          if (person.category === 'student') {
            const student = person as StudentAttachee;
            if (isBefore(student.attachmentEndDate, now) && student.status === 'active') {
              return { ...student, status: 'attachment_ended' as const };
            }
          }
          return person;
        })
      );
    };

    checkAttachments();
    const interval = setInterval(checkAttachments, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const stats: PersonnelStats = React.useMemo(() => {
    const activePersonnel = personnel.filter(p => p.status === 'active');
    const civilians = activePersonnel.filter(p => p.category === 'civilian').length;
    const policeOfficers = activePersonnel.filter(p => p.category === 'police');
    const students = personnel.filter(p => p.category === 'student');
    const activeStudents = students.filter(p => p.status === 'active').length;

    const rankBreakdown: Record<PoliceRank, number> = {
      'PC': 0,
      'Corporal': 0,
      'Sergeant': 0,
      'Senior Sergeant': 0,
      'Inspector': 0,
      'Chief Inspector': 0,
      'Superintendent': 0,
      'Senior Superintendent': 0,
      'Commissioner': 0,
    };

    policeOfficers.forEach(officer => {
      if ('rank' in officer) {
        rankBreakdown[officer.rank]++;
      }
    });

    return {
      total: activePersonnel.length,
      civilians,
      policeOfficers: policeOfficers.length,
      students: students.length,
      activeStudents,
      rankBreakdown,
    };
  }, [personnel]);

  const addPersonnel = (person: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newPerson = {
      ...person,
      id: crypto.randomUUID(),
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Personnel;
    setPersonnel(prev => [...prev, newPerson]);
  };

  const updatePersonnel = (id: string, updates: Partial<Personnel>) => {
    setPersonnel(prev =>
      prev.map(person => {
        if (person.id === id) {
          return { ...person, ...updates, updatedAt: new Date() } as Personnel;
        }
        return person;
      })
    );
  };

  const deletePersonnel = (id: string) => {
    setPersonnel(prev => prev.filter(person => person.id !== id));
  };

  const searchPersonnel = (query: string): Personnel[] => {
    if (!query.trim()) return personnel;
    const lowerQuery = query.toLowerCase();
    return personnel.filter(person => {
      const matchName = person.fullName.toLowerCase().includes(lowerQuery);
      const matchId = person.nationalId.toLowerCase().includes(lowerQuery);
      const matchForceNo = person.category === 'police' && 
        'forceNumber' in person && 
        person.forceNumber.toLowerCase().includes(lowerQuery);
      return matchName || matchId || matchForceNo;
    });
  };

  const canEdit = currentUser.role === 'officer_in_charge';
  const canDelete = currentUser.role === 'officer_in_charge';

  return (
    <PersonnelContext.Provider
      value={{
        personnel,
        stats,
        currentUser,
        setCurrentUser,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        searchPersonnel,
        canEdit,
        canDelete,
      }}
    >
      {children}
    </PersonnelContext.Provider>
  );
}

export function usePersonnel() {
  const context = useContext(PersonnelContext);
  if (context === undefined) {
    throw new Error('usePersonnel must be used within a PersonnelProvider');
  }
  return context;
}

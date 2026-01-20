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

const defaultUser: User = {
  id: '1',
  name: 'System Admin',
  role: 'officer_in_charge',
};

export function PersonnelProvider({ children }: { children: ReactNode }) {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
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
      'CPL': 0,
      'SGT': 0,
      'S/SGT': 0,
      'IP': 0,
      'CI': 0,
      'ASP': 0,
      'SP': 0,
      'SSP': 0,
      'ACP': 0,
      'CP': 0,
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

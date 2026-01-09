import { useState } from 'react';
import { Personnel, StudentAttachee, PoliceOfficer, CivilianStaff } from '@/types/personnel';
import { usePersonnel } from '@/contexts/PersonnelContext';
import { PersonnelProfile } from './PersonnelProfile';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit, Trash2, Eye, Shield, User, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PersonnelTableProps {
  data: Personnel[];
}

export function PersonnelTable({ data }: PersonnelTableProps) {
  const { canEdit, canDelete, deletePersonnel } = usePersonnel();
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const getIdentifier = (person: Personnel): string => {
    if (person.category === 'police') {
      return (person as PoliceOfficer).forceNumber;
    }
    return person.nationalId;
  };

  const getOffice = (person: Personnel): string => {
    switch (person.category) {
      case 'police':
        return (person as PoliceOfficer).department;
      case 'civilian':
        return (person as CivilianStaff).department;
      case 'student':
        return (person as StudentAttachee).officeAttachedTo;
      default:
        return '-';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'police':
        return <Shield className="h-4 w-4" />;
      case 'civilian':
        return <User className="h-4 w-4" />;
      case 'student':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'police':
        return 'Police Officer';
      case 'civilian':
        return 'Civilian Staff';
      case 'student':
        return 'Student Attachee';
      default:
        return category;
    }
  };

  const handleDelete = (person: Personnel) => {
    deletePersonnel(person.id);
    toast({
      title: 'Personnel Removed',
      description: `${person.fullName} has been removed from the system.`,
    });
  };

  const handleViewProfile = (person: Personnel) => {
    setSelectedPerson(person);
    setProfileOpen(true);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No personnel found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Identifier</th>
              <th>Office</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((person) => (
              <tr key={person.id} className="cursor-pointer" onClick={() => handleViewProfile(person)}>
                <td className="font-medium">{person.fullName}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(person.category)}
                    <span>{getCategoryLabel(person.category)}</span>
                  </div>
                </td>
                <td className="font-mono text-sm">{getIdentifier(person)}</td>
                <td>{getOffice(person)}</td>
                <td>
                  <span
                    className={cn(
                      'status-badge',
                      person.status === 'active' ? 'status-active' : 'status-ended'
                    )}
                  >
                    {person.status === 'active' ? 'Active' : 'Attachment Ended'}
                  </span>
                </td>
                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProfile(person)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Profile</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!canEdit}
                            onClick={() => {
                              if (canEdit) {
                                toast({
                                  title: 'Edit Mode',
                                  description: 'Edit functionality would open here.',
                                });
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {canEdit ? 'Edit Personnel' : 'Insufficient permissions'}
                      </TooltipContent>
                    </Tooltip>

                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!canDelete}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {canDelete ? 'Remove Personnel' : 'Insufficient permissions'}
                        </TooltipContent>
                      </Tooltip>
                      <AlertDialogContent className="bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove{' '}
                            <strong>{person.fullName}</strong> from the personnel
                            database? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(person)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove Personnel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PersonnelProfile
        person={selectedPerson}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </>
  );
}

import { format, differenceInDays, differenceInWeeks, isBefore } from 'date-fns';
import { Personnel, StudentAttachee, PoliceOfficer, CivilianStaff, Referee } from '@/types/personnel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, Shield, User, GraduationCap, Clock, AlertTriangle, UserCheck, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import atpuLogo from '@/assets/atpu-logo.png';

interface PersonnelProfileProps {
  person: Personnel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRankLabel = (rank: string): string => {
  const ranks: Record<string, string> = {
    'PC': 'Police Constable (PC)',
    'CPL': 'Corporal (CPL)',
    'SGT': 'Sergeant (SGT)',
    'S/SGT': 'Senior Sergeant (S/SGT)',
    'IP': 'Inspector (IP)',
    'CI': 'Chief Inspector (CI)',
    'ASP': 'Assistant Superintendent of Police (ASP)',
    'SP': 'Superintendent of Police (SP)',
    'SSP': 'Senior Superintendent of Police (SSP)',
    'ACP': 'Assistant Commissioner of Police (ACP)',
    'CP': 'Commissioner of Police (CP)',
  };
  return ranks[rank] || rank;
};

export function PersonnelProfile({ person, open, onOpenChange }: PersonnelProfileProps) {
  if (!person) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'police':
        return <Shield className="h-6 w-6" />;
      case 'civilian':
        return <User className="h-6 w-6" />;
      case 'student':
        return <GraduationCap className="h-6 w-6" />;
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

  const getRefereeTypeLabel = (type: string): string => {
    switch (type) {
      case 'atpu_staff':
        return 'ATPU Staff';
      case 'former_student':
        return 'Former Student';
      case 'non_atpu_officer':
        return 'Non-ATPU Officer (External)';
      default:
        return type;
    }
  };

  const renderAttachmentCountdown = () => {
    if (person.category !== 'student') return null;
    const student = person as StudentAttachee;
    const now = new Date();
    const endDate = new Date(student.attachmentEndDate);
    const isEnded = isBefore(endDate, now);

    if (isEnded) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Attachment Period Ended</p>
            <p className="text-sm text-muted-foreground">
              Ended on {format(endDate, 'PPP')}
            </p>
          </div>
        </div>
      );
    }

    const daysRemaining = differenceInDays(endDate, now);
    const weeksRemaining = differenceInWeeks(endDate, now);

    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
        <Clock className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium text-primary">Time Remaining</p>
          <p className="text-2xl font-bold">
            {weeksRemaining > 0 ? `${weeksRemaining} weeks, ` : ''}
            {daysRemaining % 7} days
          </p>
          <p className="text-sm text-muted-foreground">
            Ends on {format(endDate, 'PPP')}
          </p>
        </div>
      </div>
    );
  };

  const renderRefereeSection = () => {
    if (person.category !== 'student') return null;
    const student = person as StudentAttachee;
    const referee = student.referee;
    
    if (!referee) return null;

    return (
      <>
        <Separator />
        <div>
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Referee / Immediate Person In-Charge</h4>
            {referee.refereeType === 'non_atpu_officer' && (
              <span className="bg-warning/20 text-warning text-xs px-2 py-0.5 rounded flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                External
              </span>
            )}
          </div>
          <dl className="divide-y divide-border">
            <InfoRow label="Referee Type" value={getRefereeTypeLabel(referee.refereeType)} />
            <InfoRow label="Full Name" value={referee.fullName} />
            <InfoRow label="National ID" value={referee.nationalId} />
            <InfoRow label="Email" value={referee.email} />
            <InfoRow label="Phone Numbers" value={referee.phoneNumbers?.join(', ')} />
            
            {referee.refereeType === 'atpu_staff' && (
              <>
                <InfoRow label="Category" value={referee.personnelCategory === 'police' ? 'Police Officer' : 'Civilian Staff'} />
                {referee.personnelCategory === 'police' && (
                  <>
                    <InfoRow label="Rank" value={referee.rank ? getRankLabel(referee.rank) : '-'} />
                    <InfoRow label="Force Number" value={referee.forceNumber} />
                  </>
                )}
                {referee.personnelCategory === 'civilian' && (
                  <InfoRow label="Job Title" value={referee.jobTitle} />
                )}
                <InfoRow label="Department" value={referee.department} />
              </>
            )}

            {referee.refereeType === 'former_student' && (
              <>
                <InfoRow label="Former Office" value={referee.formerOfficeAttachedTo} />
                <InfoRow label="Employment Status" value={
                  referee.employmentStatus === 'employed' ? 'Employed' :
                  referee.employmentStatus === 'unemployed' ? 'Unemployed' : 'Student'
                } />
                {referee.employmentStatus === 'employed' && (
                  <>
                    <InfoRow label="Place of Employment" value={referee.placeOfEmployment} />
                    <InfoRow label="Employer Contact" value={
                      [referee.employerPhone, referee.employerEmail].filter(Boolean).join(' | ') || '-'
                    } />
                    <InfoRow label="Employment Confirmed By" value={referee.employmentConfirmationPerson} />
                  </>
                )}
              </>
            )}

            {referee.refereeType === 'non_atpu_officer' && (
              <>
                <InfoRow label="Rank" value={getRankLabel(referee.rank)} />
                <InfoRow label="Force Number" value={referee.forceNumber} />
                <InfoRow label="Service Body" value={
                  referee.serviceBody === 'Other' ? referee.serviceBodyOther : referee.serviceBody
                } />
              </>
            )}
          </dl>
        </div>
      </>
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm col-span-2">{value || '-'}</dd>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card print-friendly max-h-[90vh] overflow-y-auto">
        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block print:mb-6">
          <div className="flex flex-col items-center text-center">
            <img 
              src={atpuLogo} 
              alt="ATPU Logo" 
              className="h-20 w-auto object-contain mb-3"
            />
            <h1 className="text-xl font-bold text-foreground">
              Anti-Terror Police Unit Personnel Profile
            </h1>
          </div>
          <Separator className="mt-4" />
        </div>

        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                {getCategoryIcon(person.category)}
              </div>
              <div>
                <DialogTitle className="text-xl">{person.fullName}</DialogTitle>
                <p className="text-sm text-muted-foreground">{getCategoryLabel(person.category)}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4 print:mt-0">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'status-badge',
                person.status === 'active' ? 'status-active' : 'status-ended'
              )}
            >
              {person.status === 'active' ? 'Active' : 'Attachment Ended'}
            </span>
          </div>

          {/* Attachment Countdown for Students */}
          {renderAttachmentCountdown()}

          <Separator />

          {/* Basic Information */}
          <div>
            <h4 className="font-semibold mb-3">Basic Information</h4>
            <dl className="divide-y divide-border">
              <InfoRow label="Full Name" value={person.fullName} />
              <InfoRow label="National ID / Passport" value={person.nationalId} />
              <InfoRow label="Email" value={person.email} />
              <InfoRow label="Phone Numbers" value={person.phoneNumbers.join(', ')} />
            </dl>
          </div>

          <Separator />

          {/* Category-specific Information */}
          {person.category === 'police' && (
            <div>
              <h4 className="font-semibold mb-3">Police Officer Details</h4>
              <dl className="divide-y divide-border">
                <InfoRow label="Rank" value={getRankLabel((person as PoliceOfficer).rank)} />
                <InfoRow label="Force Number" value={(person as PoliceOfficer).forceNumber} />
                <InfoRow label="Title" value={(person as PoliceOfficer).title} />
                <InfoRow label="Department" value={(person as PoliceOfficer).department} />
              </dl>
            </div>
          )}

          {person.category === 'civilian' && (
            <div>
              <h4 className="font-semibold mb-3">Civilian Staff Details</h4>
              <dl className="divide-y divide-border">
                <InfoRow label="Job Title" value={(person as CivilianStaff).jobTitle} />
                <InfoRow label="Department" value={(person as CivilianStaff).department} />
              </dl>
            </div>
          )}

          {person.category === 'student' && (
            <div>
              <h4 className="font-semibold mb-3">Attachment Details</h4>
              <dl className="divide-y divide-border">
                <InfoRow label="Office Attached To" value={(person as StudentAttachee).officeAttachedTo} />
                <InfoRow 
                  label="Start Date" 
                  value={format(new Date((person as StudentAttachee).attachmentStartDate), 'PPP')} 
                />
                <InfoRow 
                  label="Duration" 
                  value={`${(person as StudentAttachee).attachmentDurationWeeks} weeks`} 
                />
                <InfoRow 
                  label="End Date" 
                  value={format(new Date((person as StudentAttachee).attachmentEndDate), 'PPP')} 
                />
              </dl>
            </div>
          )}

          {/* Referee Section for Students */}
          {renderRefereeSection()}

          <Separator />

          {/* Record Information */}
          <div>
            <h4 className="font-semibold mb-3">Record Information</h4>
            <dl className="divide-y divide-border">
              <InfoRow label="Created" value={format(new Date(person.createdAt), 'PPP')} />
              <InfoRow label="Last Updated" value={format(new Date(person.updatedAt), 'PPP')} />
            </dl>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

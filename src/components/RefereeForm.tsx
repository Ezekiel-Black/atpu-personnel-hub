import { useState, useEffect } from 'react';
import { 
  RefereeType, 
  Referee, 
  PoliceRank, 
  EmploymentStatus, 
  ServiceBody,
  Personnel
} from '@/types/personnel';
import { usePersonnel } from '@/contexts/PersonnelContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, UserCheck, AlertCircle, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const policeRanks: { value: PoliceRank; label: string }[] = [
  { value: 'PC', label: 'Police Constable (PC)' },
  { value: 'CPL', label: 'Corporal (CPL)' },
  { value: 'SGT', label: 'Sergeant (SGT)' },
  { value: 'S/SGT', label: 'Senior Sergeant (S/SGT)' },
  { value: 'IP', label: 'Inspector (IP)' },
  { value: 'CI', label: 'Chief Inspector (CI)' },
  { value: 'ASP', label: 'Assistant Superintendent of Police (ASP)' },
  { value: 'SP', label: 'Superintendent of Police (SP)' },
  { value: 'SSP', label: 'Senior Superintendent of Police (SSP)' },
  { value: 'ACP', label: 'Assistant Commissioner of Police (ACP)' },
  { value: 'CP', label: 'Commissioner of Police (CP)' },
];

const serviceBodies: { value: ServiceBody; label: string }[] = [
  { value: 'AP', label: 'Administration Police (AP)' },
  { value: 'GSU', label: 'General Service Unit (GSU)' },
  { value: 'Kenya Police Service', label: 'Kenya Police Service' },
  { value: 'Other', label: 'Other (Specify)' },
];

interface RefereeFormProps {
  value: Partial<Referee> | null;
  onChange: (referee: Partial<Referee>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function RefereeForm({ value, onChange, errors = {}, disabled = false }: RefereeFormProps) {
  const { personnel } = usePersonnel();
  const [isOpen, setIsOpen] = useState(true);
  const [refereeType, setRefereeType] = useState<RefereeType | ''>(value?.refereeType || '');
  const [useExistingPersonnel, setUseExistingPersonnel] = useState(false);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(value?.phoneNumbers || ['']);

  // Get ATPU staff for selection (police and civilian only)
  const atpuStaff = personnel.filter(p => p.category === 'police' || p.category === 'civilian');

  useEffect(() => {
    if (value?.refereeType) {
      setRefereeType(value.refereeType);
    }
    if (value?.phoneNumbers && value.phoneNumbers.length > 0) {
      setPhoneNumbers(value.phoneNumbers);
    }
  }, [value]);

  const handleRefereeTypeChange = (type: RefereeType) => {
    setRefereeType(type);
    setUseExistingPersonnel(false);
    setSelectedPersonnelId('');
    setPhoneNumbers(['']);
    onChange({
      refereeType: type,
      id: crypto.randomUUID(),
      fullName: '',
      phoneNumbers: [''],
      email: '',
      nationalId: '',
    });
  };

  const handleExistingPersonnelSelect = (personnelId: string) => {
    setSelectedPersonnelId(personnelId);
    const person = personnel.find(p => p.id === personnelId);
    if (person && (person.category === 'police' || person.category === 'civilian')) {
      const newPhones = person.phoneNumbers.length > 0 ? person.phoneNumbers : [''];
      setPhoneNumbers(newPhones);
      
      if (person.category === 'police') {
        onChange({
          refereeType: 'atpu_staff',
          id: crypto.randomUUID(),
          linkedPersonnelId: personnelId,
          fullName: person.fullName,
          phoneNumbers: newPhones,
          email: person.email,
          nationalId: person.nationalId,
          personnelCategory: 'police',
          rank: person.rank,
          forceNumber: person.forceNumber,
          department: person.department,
        });
      } else {
        onChange({
          refereeType: 'atpu_staff',
          id: crypto.randomUUID(),
          linkedPersonnelId: personnelId,
          fullName: person.fullName,
          phoneNumbers: newPhones,
          email: person.email,
          nationalId: person.nationalId,
          personnelCategory: 'civilian',
          jobTitle: person.jobTitle,
          department: person.department,
        });
      }
    }
  };

  const updateField = (field: string, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const addPhoneNumber = () => {
    const newPhones = [...phoneNumbers, ''];
    setPhoneNumbers(newPhones);
    updateField('phoneNumbers', newPhones);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newPhones = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhones);
      updateField('phoneNumbers', newPhones);
    }
  };

  const updatePhoneNumber = (index: number, phoneValue: string) => {
    const newPhones = [...phoneNumbers];
    newPhones[index] = phoneValue;
    setPhoneNumbers(newPhones);
    updateField('phoneNumbers', newPhones);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={cn(
      "form-section border-2",
      hasErrors ? "border-destructive/50" : "border-primary/20"
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-lg p-2",
                hasErrors ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              )}>
                {hasErrors ? <AlertCircle className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Referee / Immediate Person In-Charge</h3>
                <p className="text-sm text-muted-foreground">Required for student attachees</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-6 space-y-6">
          {/* Referee Type Selection */}
          <div className="space-y-2">
            <Label>Referee Type *</Label>
            <Select 
              value={refereeType} 
              onValueChange={(v) => handleRefereeTypeChange(v as RefereeType)}
              disabled={disabled}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select referee type" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="atpu_staff">ATPU Staff</SelectItem>
                <SelectItem value="former_student">Former Student</SelectItem>
                <SelectItem value="non_atpu_officer">Non-ATPU Officer (External)</SelectItem>
              </SelectContent>
            </Select>
            {errors.refereeType && (
              <p className="text-sm text-destructive">{errors.refereeType}</p>
            )}
          </div>

          {/* ATPU Staff Referee */}
          {refereeType === 'atpu_staff' && (
            <div className="space-y-6 animate-fade-in">
              {/* Option to select existing personnel */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="useExisting"
                  checked={useExistingPersonnel}
                  onChange={(e) => {
                    setUseExistingPersonnel(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedPersonnelId('');
                      setPhoneNumbers(['']);
                      onChange({
                        refereeType: 'atpu_staff',
                        id: crypto.randomUUID(),
                        fullName: '',
                        phoneNumbers: [''],
                        email: '',
                        nationalId: '',
                      });
                    }
                  }}
                  className="h-4 w-4"
                  disabled={disabled}
                />
                <Label htmlFor="useExisting" className="cursor-pointer">
                  Select from existing ATPU personnel records
                </Label>
              </div>

              {useExistingPersonnel && (
                <div className="space-y-2">
                  <Label>Select Personnel *</Label>
                  <Select 
                    value={selectedPersonnelId} 
                    onValueChange={handleExistingPersonnelSelect}
                    disabled={disabled}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Search and select personnel" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover max-h-60">
                      {atpuStaff.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.fullName} - {person.category === 'police' ? person.rank : person.jobTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Manual entry or selected personnel display */}
              {(!useExistingPersonnel || selectedPersonnelId) && (
                <>
                  <div className="space-y-2">
                    <Label>Personnel Category *</Label>
                    <Select 
                      value={(value as any)?.personnelCategory || ''} 
                      onValueChange={(v) => updateField('personnelCategory', v)}
                      disabled={disabled || useExistingPersonnel}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="police">Police Officer</SelectItem>
                        <SelectItem value="civilian">Civilian Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={value?.fullName || ''}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        placeholder="Enter full name"
                        className="bg-background"
                        disabled={disabled || useExistingPersonnel}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>National ID / Passport *</Label>
                      <Input
                        value={value?.nationalId || ''}
                        onChange={(e) => updateField('nationalId', e.target.value)}
                        placeholder="Enter ID number"
                        className="bg-background"
                        disabled={disabled || useExistingPersonnel}
                      />
                      {errors.nationalId && (
                        <p className="text-sm text-destructive">{errors.nationalId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={value?.email || ''}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="Enter email"
                        className="bg-background"
                        disabled={disabled || useExistingPersonnel}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Numbers *</Label>
                      <div className="space-y-2">
                        {phoneNumbers.map((phone, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={phone}
                              onChange={(e) => updatePhoneNumber(index, e.target.value)}
                              placeholder="+254 7XX XXX XXX"
                              className="bg-background"
                              disabled={disabled || useExistingPersonnel}
                            />
                            {phoneNumbers.length > 1 && !useExistingPersonnel && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removePhoneNumber(index)}
                                disabled={disabled}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {!useExistingPersonnel && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPhoneNumber}
                            disabled={disabled}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Phone
                          </Button>
                        )}
                      </div>
                      {errors.phoneNumbers && (
                        <p className="text-sm text-destructive">{errors.phoneNumbers}</p>
                      )}
                    </div>
                  </div>

                  {/* Police Officer specific fields */}
                  {(value as any)?.personnelCategory === 'police' && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Rank *</Label>
                        <Select 
                          value={(value as any)?.rank || ''} 
                          onValueChange={(v) => updateField('rank', v)}
                          disabled={disabled || useExistingPersonnel}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select rank" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {policeRanks.map((rank) => (
                              <SelectItem key={rank.value} value={rank.value}>
                                {rank.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Force Number *</Label>
                        <Input
                          value={(value as any)?.forceNumber || ''}
                          onChange={(e) => updateField('forceNumber', e.target.value)}
                          placeholder="e.g., AP-2024-XXXX"
                          className="bg-background"
                          disabled={disabled || useExistingPersonnel}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Department / Office *</Label>
                        <Input
                          value={(value as any)?.department || ''}
                          onChange={(e) => updateField('department', e.target.value)}
                          placeholder="e.g., Operations"
                          className="bg-background"
                          disabled={disabled || useExistingPersonnel}
                        />
                      </div>
                    </div>
                  )}

                  {/* Civilian Staff specific fields */}
                  {(value as any)?.personnelCategory === 'civilian' && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Job Title *</Label>
                        <Input
                          value={(value as any)?.jobTitle || ''}
                          onChange={(e) => updateField('jobTitle', e.target.value)}
                          placeholder="e.g., Administrative Officer"
                          className="bg-background"
                          disabled={disabled || useExistingPersonnel}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Department / Office *</Label>
                        <Input
                          value={(value as any)?.department || ''}
                          onChange={(e) => updateField('department', e.target.value)}
                          placeholder="e.g., Administration"
                          className="bg-background"
                          disabled={disabled || useExistingPersonnel}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Former Student Referee */}
          {refereeType === 'former_student' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={value?.fullName || ''}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Enter full name"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>National ID / Passport *</Label>
                  <Input
                    value={value?.nationalId || ''}
                    onChange={(e) => updateField('nationalId', e.target.value)}
                    placeholder="Enter ID number"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.nationalId && (
                    <p className="text-sm text-destructive">{errors.nationalId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={value?.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Enter email"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone Numbers *</Label>
                  <div className="space-y-2">
                    {phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={phone}
                          onChange={(e) => updatePhoneNumber(index, e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="bg-background"
                          disabled={disabled}
                        />
                        {phoneNumbers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePhoneNumber(index)}
                            disabled={disabled}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPhoneNumber}
                      disabled={disabled}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Phone
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Former Office Attached To *</Label>
                  <Input
                    value={(value as any)?.formerOfficeAttachedTo || ''}
                    onChange={(e) => updateField('formerOfficeAttachedTo', e.target.value)}
                    placeholder="e.g., ICT Department"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.formerOfficeAttachedTo && (
                    <p className="text-sm text-destructive">{errors.formerOfficeAttachedTo}</p>
                  )}
                </div>
              </div>

              {/* Current Whereabouts Section */}
              <div className="border-t border-border pt-6">
                <h4 className="font-semibold mb-4">Current Whereabouts (Mandatory)</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employment Status *</Label>
                    <Select 
                      value={(value as any)?.employmentStatus || ''} 
                      onValueChange={(v) => updateField('employmentStatus', v)}
                      disabled={disabled}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.employmentStatus && (
                      <p className="text-sm text-destructive">{errors.employmentStatus}</p>
                    )}
                  </div>

                  {(value as any)?.employmentStatus === 'employed' && (
                    <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Place of Employment *</Label>
                        <Input
                          value={(value as any)?.placeOfEmployment || ''}
                          onChange={(e) => updateField('placeOfEmployment', e.target.value)}
                          placeholder="Enter employer name/organization"
                          className="bg-background"
                          disabled={disabled}
                        />
                        {errors.placeOfEmployment && (
                          <p className="text-sm text-destructive">{errors.placeOfEmployment}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Employer Phone</Label>
                        <Input
                          value={(value as any)?.employerPhone || ''}
                          onChange={(e) => updateField('employerPhone', e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="bg-background"
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Employer Email</Label>
                        <Input
                          type="email"
                          value={(value as any)?.employerEmail || ''}
                          onChange={(e) => updateField('employerEmail', e.target.value)}
                          placeholder="Enter employer email"
                          className="bg-background"
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Person Who Can Confirm Employment</Label>
                        <Input
                          value={(value as any)?.employmentConfirmationPerson || ''}
                          onChange={(e) => updateField('employmentConfirmationPerson', e.target.value)}
                          placeholder="Enter contact person name"
                          className="bg-background"
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Non-ATPU Officer Referee */}
          {refereeType === 'non_atpu_officer' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">External (Non-ATPU) Referee</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={value?.fullName || ''}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Enter full name"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>National ID / Passport *</Label>
                  <Input
                    value={value?.nationalId || ''}
                    onChange={(e) => updateField('nationalId', e.target.value)}
                    placeholder="Enter ID number"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.nationalId && (
                    <p className="text-sm text-destructive">{errors.nationalId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={value?.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Enter email"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone Numbers *</Label>
                  <div className="space-y-2">
                    {phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={phone}
                          onChange={(e) => updatePhoneNumber(index, e.target.value)}
                          placeholder="+254 7XX XXX XXX"
                          className="bg-background"
                          disabled={disabled}
                        />
                        {phoneNumbers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePhoneNumber(index)}
                            disabled={disabled}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPhoneNumber}
                      disabled={disabled}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Phone
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rank *</Label>
                  <Select 
                    value={(value as any)?.rank || ''} 
                    onValueChange={(v) => updateField('rank', v)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {policeRanks.map((rank) => (
                        <SelectItem key={rank.value} value={rank.value}>
                          {rank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rank && (
                    <p className="text-sm text-destructive">{errors.rank}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Force Number *</Label>
                  <Input
                    value={(value as any)?.forceNumber || ''}
                    onChange={(e) => updateField('forceNumber', e.target.value)}
                    placeholder="e.g., AP-2024-XXXX"
                    className="bg-background"
                    disabled={disabled}
                  />
                  {errors.forceNumber && (
                    <p className="text-sm text-destructive">{errors.forceNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Service Body *</Label>
                  <Select 
                    value={(value as any)?.serviceBody || ''} 
                    onValueChange={(v) => updateField('serviceBody', v)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select service body" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {serviceBodies.map((body) => (
                        <SelectItem key={body.value} value={body.value}>
                          {body.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceBody && (
                    <p className="text-sm text-destructive">{errors.serviceBody}</p>
                  )}
                </div>

                {(value as any)?.serviceBody === 'Other' && (
                  <div className="space-y-2">
                    <Label>Specify Service Body *</Label>
                    <Input
                      value={(value as any)?.serviceBodyOther || ''}
                      onChange={(e) => updateField('serviceBodyOther', e.target.value)}
                      placeholder="Enter service body name"
                      className="bg-background"
                      disabled={disabled}
                    />
                    {errors.serviceBodyOther && (
                      <p className="text-sm text-destructive">{errors.serviceBodyOther}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

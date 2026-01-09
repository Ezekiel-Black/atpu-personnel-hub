import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addWeeks } from 'date-fns';
import { usePersonnel } from '@/contexts/PersonnelContext';
import { PersonnelCategory, PoliceRank } from '@/types/personnel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Plus, X } from 'lucide-react';

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

const baseSchema = z.object({
  category: z.enum(['civilian', 'police', 'student']),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  nationalId: z.string().min(6, 'Invalid ID number').max(20),
  phoneNumbers: z.array(z.string().min(10, 'Invalid phone number')).min(1, 'At least one phone number required'),
});

const policeSchema = baseSchema.extend({
  category: z.literal('police'),
  rank: z.enum(['PC', 'CPL', 'SGT', 'S/SGT', 'IP', 'CI', 'ASP', 'SP', 'SSP', 'ACP', 'CP']),
  forceNumber: z.string().min(4, 'Invalid force number'),
  title: z.string().optional(),
  department: z.string().min(2, 'Department required'),
});

const civilianSchema = baseSchema.extend({
  category: z.literal('civilian'),
  jobTitle: z.string().min(2, 'Job title required'),
  department: z.string().min(2, 'Department required'),
});

const studentSchema = baseSchema.extend({
  category: z.literal('student'),
  attachmentStartDate: z.string().min(1, 'Start date required'),
  attachmentDurationWeeks: z.number().min(1, 'Duration must be at least 1 week').max(52),
  officeAttachedTo: z.string().min(2, 'Office required'),
});

type FormData = z.infer<typeof policeSchema> | z.infer<typeof civilianSchema> | z.infer<typeof studentSchema>;

export function PersonnelForm() {
  const navigate = useNavigate();
  const { addPersonnel } = usePersonnel();
  const [category, setCategory] = useState<PersonnelCategory>('police');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);

  const getSchema = () => {
    switch (category) {
      case 'police':
        return policeSchema;
      case 'civilian':
        return civilianSchema;
      case 'student':
        return studentSchema;
      default:
        return baseSchema;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      category: 'police',
      phoneNumbers: [''],
    },
  });

  const addPhoneNumber = () => {
    const newPhones = [...phoneNumbers, ''];
    setPhoneNumbers(newPhones);
    setValue('phoneNumbers', newPhones);
  };

  const removePhoneNumber = (index: number) => {
    if (phoneNumbers.length > 1) {
      const newPhones = phoneNumbers.filter((_, i) => i !== index);
      setPhoneNumbers(newPhones);
      setValue('phoneNumbers', newPhones);
    }
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const newPhones = [...phoneNumbers];
    newPhones[index] = value;
    setPhoneNumbers(newPhones);
    setValue('phoneNumbers', newPhones);
  };

  const onSubmit = (data: FormData) => {
    try {
      let personnelData: any = {
        ...data,
        phoneNumbers: phoneNumbers.filter(p => p.trim() !== ''),
      };

      if (data.category === 'student') {
        const startDate = new Date(data.attachmentStartDate);
        const endDate = addWeeks(startDate, data.attachmentDurationWeeks);
        personnelData = {
          ...personnelData,
          attachmentStartDate: startDate,
          attachmentEndDate: endDate,
        };
      }

      addPersonnel(personnelData);
      
      toast({
        title: 'Personnel Registered',
        description: `${data.fullName} has been successfully registered.`,
      });
      
      reset();
      setPhoneNumbers(['']);
      navigate('/search');
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'An error occurred while registering personnel.',
        variant: 'destructive',
      });
    }
  };

  const handleCategoryChange = (value: PersonnelCategory) => {
    setCategory(value);
    setValue('category', value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
      {/* Category Selection */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Personnel Category</h3>
        <div className="space-y-2">
          <Label htmlFor="category">Select Category *</Label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="police">Police Officer</SelectItem>
              <SelectItem value="civilian">Civilian Staff</SelectItem>
              <SelectItem value="student">Student Attachee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Basic Information */}
      <div className="form-section">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Enter full name"
              className="bg-background"
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId">National ID / Passport Number *</Label>
            <Input
              id="nationalId"
              {...register('nationalId')}
              placeholder="Enter ID number"
              className="bg-background"
            />
            {errors.nationalId && (
              <p className="text-sm text-destructive">{errors.nationalId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email"
              className="bg-background"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
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
                  />
                  {phoneNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePhoneNumber(index)}
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
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phone Number
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Police Officer Fields */}
      {category === 'police' && (
        <div className="form-section">
          <h3 className="text-lg font-semibold mb-4">Police Officer Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rank">Rank *</Label>
              <Select onValueChange={(value) => setValue('rank' as any, value)}>
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
              {(errors as any).rank && (
                <p className="text-sm text-destructive">{(errors as any).rank.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="forceNumber">Force Number *</Label>
              <Input
                id="forceNumber"
                {...register('forceNumber' as any)}
                placeholder="e.g., AP-2024-XXXX"
                className="bg-background"
              />
              {(errors as any).forceNumber && (
                <p className="text-sm text-destructive">{(errors as any).forceNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                {...register('title' as any)}
                placeholder="e.g., Senior Operations Officer"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department / Office *</Label>
              <Input
                id="department"
                {...register('department' as any)}
                placeholder="e.g., Operations"
                className="bg-background"
              />
              {(errors as any).department && (
                <p className="text-sm text-destructive">{(errors as any).department.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Civilian Staff Fields */}
      {category === 'civilian' && (
        <div className="form-section">
          <h3 className="text-lg font-semibold mb-4">Civilian Staff Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                {...register('jobTitle' as any)}
                placeholder="e.g., Administrative Officer"
                className="bg-background"
              />
              {(errors as any).jobTitle && (
                <p className="text-sm text-destructive">{(errors as any).jobTitle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department / Office *</Label>
              <Input
                id="department"
                {...register('department' as any)}
                placeholder="e.g., Administration"
                className="bg-background"
              />
              {(errors as any).department && (
                <p className="text-sm text-destructive">{(errors as any).department.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Attachee Fields */}
      {category === 'student' && (
        <div className="form-section">
          <h3 className="text-lg font-semibold mb-4">Attachment Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="attachmentStartDate">Attachment Start Date *</Label>
              <Input
                id="attachmentStartDate"
                type="date"
                {...register('attachmentStartDate' as any)}
                className="bg-background"
              />
              {(errors as any).attachmentStartDate && (
                <p className="text-sm text-destructive">{(errors as any).attachmentStartDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentDurationWeeks">Duration (Weeks) *</Label>
              <Input
                id="attachmentDurationWeeks"
                type="number"
                min={1}
                max={52}
                {...register('attachmentDurationWeeks' as any, { valueAsNumber: true })}
                placeholder="e.g., 12"
                className="bg-background"
              />
              {(errors as any).attachmentDurationWeeks && (
                <p className="text-sm text-destructive">{(errors as any).attachmentDurationWeeks.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="officeAttachedTo">Office Attached To *</Label>
              <Input
                id="officeAttachedTo"
                {...register('officeAttachedTo' as any)}
                placeholder="e.g., ICT Department"
                className="bg-background"
              />
              {(errors as any).officeAttachedTo && (
                <p className="text-sm text-destructive">{(errors as any).officeAttachedTo.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <UserPlus className="mr-2 h-4 w-4" />
          Register Personnel
        </Button>
      </div>
    </form>
  );
}

import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { PersonnelTable } from '@/components/PersonnelTable';
import { usePersonnel } from '@/contexts/PersonnelContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Users } from 'lucide-react';
import { PersonnelCategory, PersonnelStatus } from '@/types/personnel';

export default function SearchPersonnel() {
  const { personnel } = usePersonnel();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PersonnelCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PersonnelStatus | 'all'>('all');

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      // Text search
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        person.fullName.toLowerCase().includes(query) ||
        person.nationalId.toLowerCase().includes(query) ||
        (person.category === 'police' &&
          'forceNumber' in person &&
          person.forceNumber.toLowerCase().includes(query));

      // Category filter
      const matchesCategory =
        categoryFilter === 'all' || person.category === categoryFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || person.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [personnel, searchQuery, categoryFilter, statusFilter]);

  // Separate active and ended attachments
  const activePersonnel = filteredPersonnel.filter(p => p.status === 'active');
  const endedAttachments = filteredPersonnel.filter(p => p.status === 'attachment_ended');

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h1 className="page-title">Search Personnel</h1>
              <p className="page-description">
                Find personnel by name, ID number, or force number
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="form-section">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Search & Filter</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or force number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as PersonnelCategory | 'all')}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="police">Police Officers</SelectItem>
                <SelectItem value="civilian">Civilian Staff</SelectItem>
                <SelectItem value="student">Student Attachees</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as PersonnelStatus | 'all')}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="attachment_ended">Attachment Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Showing {filteredPersonnel.length} of {personnel.length} personnel
          </span>
        </div>

        {/* Active Personnel Table */}
        {activePersonnel.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              Active Personnel ({activePersonnel.length})
            </h3>
            <PersonnelTable data={activePersonnel} />
          </div>
        )}

        {/* Ended Attachments */}
        {endedAttachments.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              Ended Attachments ({endedAttachments.length})
            </h3>
            <PersonnelTable data={endedAttachments} />
          </div>
        )}

        {/* No Results */}
        {filteredPersonnel.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No personnel found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

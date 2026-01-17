import { usePersonnel } from '@/contexts/PersonnelContext';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { ActionCard } from '@/components/ActionCard';
import { CategoryBreakdownChart, RankBreakdownChart } from '@/components/AnalyticsCharts';
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  User, 
  GraduationCap,
  BarChart3
} from 'lucide-react';
import atpuLogo from '@/assets/atpu-logo.png';

const Index = () => {
  const { stats, canEdit, canDelete } = usePersonnel();

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="page-header">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={atpuLogo} 
              alt="ATPU Logo" 
              className="h-20 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to ATPU Personnel Database
              </h1>
              <p className="text-muted-foreground mt-1">
                Anti-Terror Police Unit • Personnel Management System
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              title="Register Personnel"
              description="Add new staff to the database"
              icon={<UserPlus className="h-6 w-6" />}
              to="/register"
            />
            <ActionCard
              title="Search Personnel"
              description="Find and view personnel records"
              icon={<Search className="h-6 w-6" />}
              to="/search"
            />
            <ActionCard
              title="Edit Personnel"
              description="Modify existing records"
              icon={<Edit className="h-6 w-6" />}
              to="/search"
              disabled={!canEdit}
            />
            <ActionCard
              title="Remove Personnel"
              description="Delete records from system"
              icon={<Trash2 className="h-6 w-6" />}
              to="/search"
              disabled={!canDelete}
            />
          </div>
        </section>

        {/* Statistics Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Personnel Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Active Personnel"
              value={stats.total}
              icon={<Users className="h-5 w-5" />}
              variant="primary"
            />
            <StatCard
              title="Police Officers"
              value={stats.policeOfficers}
              icon={<Shield className="h-5 w-5" />}
              description="Active officers on duty"
              variant="primary"
            />
            <StatCard
              title="Civilian Staff"
              value={stats.civilians}
              icon={<User className="h-5 w-5" />}
              description="Administrative & support"
              variant="success"
            />
            <StatCard
              title="Student Attachees"
              value={`${stats.activeStudents} / ${stats.students}`}
              icon={<GraduationCap className="h-5 w-5" />}
              description="Active / Total"
              variant="warning"
            />
          </div>
        </section>

        {/* Analytics Charts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Analytics Overview</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="dashboard-card">
              <h3 className="font-semibold mb-4">Personnel by Category</h3>
              <CategoryBreakdownChart />
            </div>
            <div className="dashboard-card">
              <h3 className="font-semibold mb-4">Police Officers by Rank</h3>
              <RankBreakdownChart />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;

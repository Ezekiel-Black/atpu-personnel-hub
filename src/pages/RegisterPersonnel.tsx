import { Layout } from '@/components/Layout';
import { PersonnelForm } from '@/components/PersonnelForm';
import { UserPlus } from 'lucide-react';

export default function RegisterPersonnel() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="page-title">Register New Personnel</h1>
              <p className="page-description">
                Add a new member to the ATPU personnel database
              </p>
            </div>
          </div>
        </div>

        <PersonnelForm />
      </div>
    </Layout>
  );
}

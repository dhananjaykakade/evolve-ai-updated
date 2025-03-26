
import React from 'react';
import Layout from '@/components/layout/Layout';
import AssignmentList from '@/components/assignments/AssignmentList';

const Assignments: React.FC = () => {
  return (
    <Layout title="Assignments">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground">
            View, download, and submit your assignments.
          </p>
        </div>
        
        <AssignmentList />
      </div>
    </Layout>
  );
};

export default Assignments;

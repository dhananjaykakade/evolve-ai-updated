
import React from 'react';
import Layout from '@/components/layout/Layout';
import AssignmentOverview from '@/components/dashboard/AssignmentOverview';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import PerformanceGraph from '@/components/dashboard/PerformanceGraph';
import RecentFeedback from '@/components/dashboard/RecentFeedback';
import QuickLinks from '@/components/dashboard/QuickLinks';

const Dashboard: React.FC = () => {
  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Hello, Alex</h2>
        <p className="text-muted-foreground">
          Track your assignments, performance, and get personalized feedback.
        </p>
        
        <AssignmentOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingDeadlines />
          <RecentFeedback />
        </div>
        
        
        <div className="pt-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <QuickLinks />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

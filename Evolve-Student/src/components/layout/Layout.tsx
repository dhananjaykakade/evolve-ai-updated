
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header title={title} />
        <div className="container mx-auto py-6 px-4 md:px-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Bot, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  Sparkles,
  Bell,
  FileText
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, isActive }) => {
  return (
    <Link
      to={to}
      className={`nav-link group ${isActive ? 'nav-link-active' : ''} ${
        isCollapsed ? 'justify-center px-2' : ''
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>
      {!isCollapsed && <span>{label}</span>}
      {isCollapsed && (
        <div className="absolute left-full ml-2 z-50 hidden rounded-md bg-black px-2 py-1 text-xs text-white group-hover:block">
          {label}
        </div>
      )}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const navigationItems = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/assignments", icon: <BookOpen size={18} />, label: "Assignments" },
    { to: "/tests", icon: <FileText size={18} />, label: "Tests" },
    { to: "/feedback", icon: <Sparkles size={18} />, label: "AI Feedback" },
    { to: "/chat-room", icon: <MessageSquare size={18} />, label: "Chat Room" },
    { to: "/ai-chat", icon: <Bot size={18} />, label: "AI Chatbot" },
    { to: "/student-groups", icon: <Users size={18} />, label: "Student Groups" },
    { to: "/notifications", icon: <Bell size={18} />, label: "Notifications" },
    { to: "/profile", icon: <Settings size={18} />, label: "Settings" },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`h-screen bg-sidebar relative border-r transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <h1 className="text-lg font-semibold">StudentHub</h1>
          </div>
        )}
        {isCollapsed && (
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center mx-auto">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        )}
      </div>
      
      <button
        onClick={toggleSidebar}
        className="sidebar-toggle"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
      
      <nav className="space-y-1 px-2 py-5">
        {navigationItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isCollapsed={isCollapsed}
            isActive={location.pathname === item.to}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

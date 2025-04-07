
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageCircle,
  FileText,
  Settings,
  HelpCircle,
  X,
  BrainCircuit,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Assignments", path: "/assignments", icon: BookOpen },
  { name: "Students", path: "/students", icon: Users },
  { name: "AI Tools", path: "/ai-tools", icon: BrainCircuit },
  { name: "Chat Support", path: "/chat", icon: MessageCircle },
  { name: "Resources", path: "/resources", icon: FileText },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Help", path: "/help", icon: HelpCircle },
  { name: "Logout", path: "/login", icon: X },
];

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
      try {
        await logout();
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button - mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-white sm:hidden"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border/10 px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sidebar">
              <BookOpen className="h-5 w-5" />
            </div>
            <span>LearnLane</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
  const isActive = location.pathname === item.path;

  // Handle Logout separately
  const isLogout = item.name === "Logout";

  return isLogout ? (
    <button
      key={item.name}
      onClick={handleLogout}
      className={cn(
        "w-full text-left group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
      )}
    >
      <item.icon className="mr-3 h-5 w-5 text-sidebar-foreground/70 group-hover:scale-110 transition-transform duration-200" />
      {item.name}
    </button>
  ) : (
    <Link
      key={item.name}
      to={item.path}
      className={cn(
        "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-white/10 text-white"
          : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
      )}
      onClick={() => setIsOpen(false)}
    >
      <item.icon
        className={cn(
          "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
          isActive ? "text-white" : "text-sidebar-foreground/70"
        )}
      />
      {item.name}
    </Link>
  );
})}

        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border/10 p-4">
          <div className="rounded-lg bg-white/10 p-3 text-xs text-sidebar-foreground/90">
            <p className="font-medium">Prof. Michelle Johnson</p>
            <p className="mt-1 text-sidebar-foreground/70">Computer Science Dept.</p>
          </div>
        </div>
      </div>
    </>
  );
};

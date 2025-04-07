import React, { useState } from "react";
import {
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth();

  const handleLogout = () => {
    // In a real app, you would call an API to logout and clear user session
    // Simulate logout
    setTimeout(() => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });

      // Navigate to login page
      // In a real app, you would have a proper login page
      // For now, we'll just navigate to the home page
      navigate("/");
    }, 500);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/profile"); // For now, navigate to profile page
  };

  const handleSupportClick = () => {
    // In a real app, you would navigate to a support page or open a support modal
    toast({
      title: "Support",
      description: "The support feature is coming soon!",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for: ${searchQuery}`,
      });
      // In a real app, you would implement actual search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 w-full">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <h1 className="text-xl font-medium">{title}</h1>

        {!isMobile && (
          <div className="relative w-full max-w-sm mx-auto hidden md:flex">
            <form onSubmit={handleSearch} className="w-full">
              {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assignments, feedback..."
                className="w-full rounded-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              /> */}
            </form>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative rounded-full h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors">
                <Bell size={18} />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
              </button>
            </DropdownMenuTrigger>
            <NotificationDropdown />
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full h-8 w-8 flex items-center justify-center bg-muted">
                <User size={15} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Alex Johnson</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleProfileClick}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSettingsClick}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSupportClick}
                className="cursor-pointer"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut  className="mr-2 h-4 w-4" />
                <button onClick={logout}>

                Log out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

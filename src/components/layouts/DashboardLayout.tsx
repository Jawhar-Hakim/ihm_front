import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Briefcase, User, FileText, LogOut, LayoutDashboard, Globe, Settings, Users } from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <Briefcase size={18} className="text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg hidden sm:inline-block">HireFlow</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4 space-x-2 sm:space-x-4">
            {(user?.role === 'company' || user?.role === 'candidate') && (
              <div className="hidden md:flex items-center">
                <Button size="sm" variant="default" asChild className="rounded-full shadow-sm bg-primary hover:bg-primary/90">
                  <Link to={`/${user.role}`} className="flex items-center gap-1.5">
                    <LayoutDashboard size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
                  </Link>
                </Button>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/50 shadow-sm p-0 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-black">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 p-2 shadow-xl border-border/50 bg-background/95 backdrop-blur" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-3 mb-2 bg-muted/30 rounded-lg">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-foreground">{user?.email}</p>
                    <p className="text-xs font-bold leading-none text-primary uppercase tracking-widest mt-1 opacity-70">
                      {user?.role} Role
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="mb-2" />
                
                {user?.role === 'candidate' && (
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="rounded-md focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <Link to="/candidate/profile" className="flex items-center py-2">
                        <User className="mr-3 h-4 w-4" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-md focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <Link to="/candidate/applications" className="flex items-center py-2">
                        <FileText className="mr-3 h-4 w-4" />
                        <span className="font-medium">My Applications</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                )}

                {user?.role === 'company' && (
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="rounded-md focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <Link to="/company" className="flex items-center py-2">
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span className="font-medium">Dashboard Overview</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-md focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <Link to="/company/offers" className="flex items-center py-2">
                        <Briefcase className="mr-3 h-4 w-4" />
                        <span className="font-medium">Manage Job Offers</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                )}

                {user?.role === 'admin' && (
                  <div className="space-y-1">
                    <DropdownMenuItem asChild className="rounded-md focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <Link to="/admin" className="flex items-center py-2">
                        <Settings className="mr-3 h-4 w-4" />
                        <span className="font-medium">Admin Console</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                )}
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem onClick={handleLogout} className="rounded-md cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground py-2 font-bold">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out Account</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

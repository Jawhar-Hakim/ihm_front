import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, User, Search, FileText, Building2, Briefcase, Users,
  FolderTree, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  candidate: [
    { label: 'Dashboard', path: '/candidate', icon: <LayoutDashboard size={20} /> },
    { label: 'My Profile', path: '/candidate/profile', icon: <User size={20} /> },
    { label: 'Search Jobs', path: '/candidate/jobs', icon: <Search size={20} /> },
    { label: 'My Applications', path: '/candidate/applications', icon: <FileText size={20} /> },
  ],
  company: [
    { label: 'Dashboard', path: '/company', icon: <LayoutDashboard size={20} /> },
    { label: 'Job Offers', path: '/company/offers', icon: <Briefcase size={20} /> },
    { label: 'Candidates', path: '/company/candidates', icon: <Users size={20} /> },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Accounts', path: '/admin/accounts', icon: <Users size={20} /> },
    { label: 'Categories', path: '/admin/categories', icon: <FolderTree size={20} /> },
  ],
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'candidate';
  const items = NAV_ITEMS[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = role === 'candidate' ? 'Candidate' : role === 'company' ? 'Company' : 'Admin';

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Briefcase size={18} className="text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">HireFlow</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="text-xs uppercase tracking-wider text-sidebar-foreground/40 font-medium">{roleLabel} Panel</div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {items.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                {item.icon}
                {item.label}
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.email}</div>
              <div className="text-xs text-sidebar-foreground/50 capitalize">{role}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8 bg-card">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
            <Menu size={20} />
          </button>
          <div className="font-heading font-semibold text-lg hidden lg:block">
            {items.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

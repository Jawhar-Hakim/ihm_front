import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, FileText, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesService } from '@/services/candidates.service';
import type { Application } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      candidatesService.getApplications(user.id)
        .then(data => setApplications(data))
        .catch(err => console.error('Failed to fetch applications', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const stats = [
    { label: 'Applications', value: applications.length.toString(), icon: <FileText size={20} />, color: 'text-primary' },
    { label: 'Profile Views', value: '...', icon: <User size={20} />, color: 'text-secondary' },
    { label: 'Saved Jobs', value: '...', icon: <Search size={20} />, color: 'text-accent' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's your activity overview.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-heading font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/candidate/applications">View all <ArrowRight size={14} /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
            ) : applications.length > 0 ? (
              applications.slice(0, 3).map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium text-sm">{app.jobTitle || 'Job Application'}</div>
                    <div className="text-xs text-muted-foreground">{app.companyName || 'Company'} · {new Date(app.submittedAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[app.status] || 'bg-muted text-muted-foreground'}`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No applications yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/candidate/jobs"><Search size={16} className="mr-2" /> Search Job Offers</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/candidate/profile"><User size={16} className="mr-2" /> Edit My Profile</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/candidate/applications"><FileText size={16} className="mr-2" /> View Applications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateDashboard;

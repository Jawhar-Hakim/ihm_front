import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesService } from '@/services/candidates.service';
import { Loader2, FileText, Bookmark, Clock, CheckCircle2, XCircle, Building2, MapPin, Calendar, ChevronRight } from 'lucide-react';
import type { Application } from '@/types';
import { Link } from 'react-router-dom';

const STATUS_MAP: Record<string, { label: string; textColor: string; bgColor: string; border: string; icon: React.ReactNode }> = {
  'en attente': { label: 'Under Review', textColor: 'text-amber-700', bgColor: 'bg-amber-50', border: 'border-amber-200', icon: <Clock size={14} className="mr-1.5" /> },
  'pending': { label: 'Under Review', textColor: 'text-amber-700', bgColor: 'bg-amber-50', border: 'border-amber-200', icon: <Clock size={14} className="mr-1.5" /> },
  
  'acceptée': { label: 'Offered', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 size={14} className="mr-1.5" /> },
  'accepted': { label: 'Offered', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 size={14} className="mr-1.5" /> },
  
  'refusée': { label: 'Not Selected', textColor: 'text-rose-700', bgColor: 'bg-rose-50', border: 'border-rose-200', icon: <XCircle size={14} className="mr-1.5" /> },
  'rejected': { label: 'Not Selected', textColor: 'text-rose-700', bgColor: 'bg-rose-50', border: 'border-rose-200', icon: <XCircle size={14} className="mr-1.5" /> },
};

const Applications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      candidatesService.getApplications(user.id)
        .then(data => setApplications(data))
        .catch(err => console.error('Failed to fetch applications:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Derived state
  const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'en attente');
  const finishedApps = applications.filter(a => a.status !== 'pending' && a.status !== 'en attente');

  const renderApplicationCard = (app: Application) => {
    const originalStatus = app.status?.toLowerCase() || 'pending';
    const statusConfig = STATUS_MAP[originalStatus] || STATUS_MAP['pending'];
    const companyInitial = app.companyName ? app.companyName.charAt(0).toUpperCase() : 'C';
    
    return (
      <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-border/60">
        <CardContent className="p-0">
          <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5">
            {/* Logo placeholder */}
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-xl font-bold text-primary border border-primary/10">
              {companyInitial}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div className="flex items-center gap-3">
                  <div className="sm:hidden h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 font-bold text-primary border border-primary/10">
                    {companyInitial}
                  </div>
                  <h4 className="font-heading font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                    {app.jobTitle || 'Job Application'}
                  </h4>
                </div>
                
                {/* Status Badge */}
                <div className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.border} border`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 size={15} className="shrink-0" />
                  <span className="truncate">{app.companyName || 'Company'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Calendar size={15} />
                  <span>Applied on {new Date(app.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 border-l pl-5 border-border/50 text-muted-foreground">
              <ChevronRight size={24} className="hover:text-primary transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 px-4 sm:px-0">
      <div className="bg-gradient-hero rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-32 mb-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 relative z-10">Your Journey</h1>
        <p className="text-lg text-primary-foreground/80 max-w-xl relative z-10">Keep an eye on how your current applications are holding up or review your saved jobs to plan your next move.</p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-16 bg-muted/30 backdrop-blur-md p-3 z-30 rounded-2xl border">
          <TabsList className="w-full sm:w-[400px] grid grid-cols-2 p-1.5 bg-muted rounded-xl h-12">
            <TabsTrigger value="applications" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-base h-full font-medium transition-all">Activities</TabsTrigger>
            <TabsTrigger value="saved" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-base h-full font-medium transition-all">Saved Jobs</TabsTrigger>
          </TabsList>
          
          <div className="text-sm font-medium bg-background border px-4 py-2.5 rounded-xl shadow-sm text-muted-foreground flex items-center justify-center">
             <span className="text-foreground mr-1.5">{applications.length}</span> Total Applications
          </div>
        </div>

        <TabsContent value="applications" className="mt-0 space-y-8 min-h-[40vh] animate-in fade-in duration-500">
          {loading ? (
            <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
          ) : applications.length > 0 ? (
            <div className="space-y-12">
              {/* Active Applications */}
              {pendingApps.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/10">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-200 to-amber-100 text-amber-700 shadow-sm flex items-center justify-center">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground leading-none">
                        In Progress
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Awaiting employer's response</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto px-3 py-1 font-semibold text-sm bg-amber-50 text-amber-700 hover:bg-amber-100">{pendingApps.length} Active</Badge>
                  </div>
                  <div className="flex flex-col gap-4">
                    {pendingApps.map((app) => (
                      <Link to="/candidate/jobs" state={{ search: app.jobTitle }} key={app.id}>
                        {renderApplicationCard(app)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Finished Applications */}
              {finishedApps.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-border/50">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-muted to-muted/50 text-muted-foreground shadow-sm flex items-center justify-center border">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground leading-none">
                        Past Applications
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Resolved job prospects</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 opacity-90 transition-opacity hover:opacity-100">
                    {finishedApps.map((app) => (
                      <Link to="/candidate/jobs" state={{ search: app.jobTitle }} key={app.id}>
                        {renderApplicationCard(app)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-muted/20 border-2 border-dashed rounded-3xl text-center">
              <div className="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <FileText size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">No applications yet</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Your journey starts here. Use our search tool to find jobs that match your skills and passions.
              </p>
              <Button asChild size="lg" className="rounded-full px-8">
                <a href="/candidate/jobs">Browse Jobs</a>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-muted/20 border-2 border-dashed rounded-3xl text-center">
            <div className="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Bookmark size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Your Saved Collection</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Keep track of interesting positions here. Save jobs to apply later.
            </p>
            <Button variant="outline" asChild size="lg" className="rounded-full px-8">
              <a href="/candidate/jobs">Explore Opportunities</a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Applications;

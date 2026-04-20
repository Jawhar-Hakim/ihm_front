import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, User, FileText, CheckCircle, XCircle, Briefcase, Mail, Calendar } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ViewCandidates: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const userId = user?.id || (user as any)?._id;
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const profile = await jobsService.getCompanyProfile(userId);
        const offers = await jobsService.getAll({ societe: profile._id });
        const allApplications: any[] = [];
        
        for (const offer of offers) {
          const offerId = offer.id || (offer as any)._id;
          try {
            const apps = await jobsService.getApplications(offerId);
            const enrichedApps = apps.map((app: any) => ({
              ...app,
              jobTitle: offer.title,
              jobId: offerId,
            }));
            allApplications.push(...enrichedApps);
          } catch (e) {
            console.error(`Failed to fetch apps for offer ${offerId}`, e);
          }
        }
        setApplications(allApplications);
      } catch (e: any) {
        toast({ title: 'Error', description: `Failed to load applications: ${e.message}`, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [toast, user]);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      setUpdatingId(appId);
      await jobsService.updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(app => 
        (app.id || app._id) === appId ? { ...app, status } : app
      ));
      toast({ title: 'Success', description: `Application ${status.toLowerCase()} successfully` });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const openCV = (cvUrl?: string) => {
    if (!cvUrl) {
      toast({ title: "No CV", description: "This candidate did not provide a CV.", variant: "destructive" });
      return;
    }
    
    if (cvUrl.startsWith('data:') || cvUrl.startsWith('blob:')) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${cvUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        toast({ title: "Popup Blocked", description: "Please allow popups to view the CV.", variant: "destructive" });
      }
    } else {
      // If it's a relative path (doesn't start with http/https), prefix with API base
      let fullUrl = cvUrl;
      if (!cvUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
        fullUrl = `${baseUrl}/${cvUrl.startsWith('/') ? cvUrl.slice(1) : cvUrl}`;
      }
      window.open(fullUrl, '_blank');
    }
  };

  const filteredApplications = applications.filter(a => {
    const candidate = a.candidate || a.candidat || {};
    const candidateName = `${candidate.prenom || candidate.firstName || ''} ${candidate.nom || candidate.lastName || ''}`.toLowerCase();
    const jobTitle = (a.jobTitle || '').toLowerCase();
    const sTerm = search.toLowerCase();
    return candidateName.includes(sTerm) || jobTitle.includes(sTerm);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight">Global Applicants</h1>
          <p className="text-muted-foreground mt-1 text-lg">Review and manage all candidates across your job offers.</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <Input 
          placeholder="Search by candidate name or job title..." 
          className="pl-12 h-14 text-lg border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading all applications...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.length > 0 ? (
            filteredApplications.map(app => {
              const appId = app.id || app._id;
              const candidate = app.candidate || app.candidat || {};
              const name = candidate.nom ? `${candidate.prenom} ${candidate.nom}` : 'Potential Candidate';
              const appStatus = app.status || 'pending';

              return (
                <Card key={appId} className="border-none bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden border border-transparent hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {name.charAt(0)}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                        appStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        appStatus === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {appStatus}
                      </span>
                    </div>
                    <CardTitle className="mt-4 text-xl font-bold group-hover:text-primary transition-colors">{name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 font-medium text-foreground/80">
                      <Briefcase size={14} className="text-primary" /> {app.jobTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail size={14} /> {candidate.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> Applied {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-primary font-bold" 
                      onClick={() => openCV(app.cvUrl)}
                    >
                      <FileText size={16} className="mr-2" /> View Full Resume
                    </Button>

                    <div className="pt-4 flex gap-2">
                      {appStatus === 'pending' ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20"
                            onClick={() => handleUpdateStatus(appId, 'accepted')}
                            disabled={updatingId === appId}
                          >
                            <CheckCircle size={16} className="mr-2" /> Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-950/20"
                            onClick={() => handleUpdateStatus(appId, 'rejected')}
                            disabled={updatingId === appId}
                          >
                            <XCircle size={16} className="mr-2" /> Decline
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1 text-center py-2 bg-muted rounded-lg text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Decision: {appStatus}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-20 bg-muted/20 border border-dashed rounded-2xl border-border">
              <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-1">No applications found</h3>
              <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewCandidates;

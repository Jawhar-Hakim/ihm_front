import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { candidatesService } from '@/services/candidates.service';
import { jobsService } from '@/services/jobs.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ViewCandidates: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const companyId = user?.id || (user as any)?._id;
      if (!companyId) {
        setLoading(false);
        return;
      }
      try {
        const offers = await jobsService.getAll({ societe: companyId });
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
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load applications', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [toast, user]);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await jobsService.updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(app => 
        (app.id || app._id) === appId ? { ...app, status } : app
      ));
      toast({ title: 'Success', description: `Application ${status.toLowerCase()} successfully` });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const filteredApplications = applications.filter(a => {
    const candidateName = `${a.candidate?.firstName || a.candidat?.nom || ''} ${a.candidate?.lastName || a.candidat?.prenom || ''}`.toLowerCase();
    const jobTitle = (a.jobTitle || '').toLowerCase();
    const sTerm = search.toLowerCase();
    return candidateName.includes(sTerm) || jobTitle.includes(sTerm);
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1 text-lg">Review and manage candidates who applied to your offers.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input 
          placeholder="Search by candidate name or job title..." 
          className="pl-10 h-12"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.length > 0 ? (
            filteredApplications.map(app => {
              const appId = app.id || app._id;
              const candidate = app.candidate || app.candidat || {};
              const fName = candidate.firstName || candidate.prenom || 'Unknown';
              const lName = candidate.lastName || candidate.nom || 'Candidate';
              const appStatus = app.status || app.etat || 'pending';

              return (
                <Card key={appId} className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <User size={24} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg font-bold truncate">{fName} {lName}</h3>
                        <p className="text-sm text-primary font-medium truncate">Applied for: {app.jobTitle}</p>
                        <div className="mt-2 flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            appStatus.toLowerCase() === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            appStatus.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-primary/20 hover:bg-primary/10 text-primary"
                        onClick={() => handleUpdateStatus(appId, 'accepted')}
                        disabled={appStatus.toLowerCase() === 'accepted'}
                      >
                        <CheckCircle size={16} className="mr-2" /> Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-destructive/20 hover:bg-destructive/10 text-destructive"
                        onClick={() => handleUpdateStatus(appId, 'rejected')}
                        disabled={appStatus.toLowerCase() === 'rejected'}
                      >
                        <XCircle size={16} className="mr-2" /> Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 bg-muted/20 border border-dashed rounded-xl border-border">
              <FileText size={32} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-foreground font-medium mb-1">No applications found</p>
              <p className="text-muted-foreground text-sm">When candidates apply to your offers, they will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewCandidates;

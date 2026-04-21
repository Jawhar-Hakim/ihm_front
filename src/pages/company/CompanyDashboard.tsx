import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, ArrowRight, Plus, Loader2, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsService } from '@/services/jobs.service';
import type { JobOffer } from '@/types';

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const userId = user?.id || (user as any)?._id;
      if (userId) {
        try {
          const profile = await jobsService.getCompanyProfile(userId);
          const offersData = await jobsService.getAll({ societe: profile._id });
          setOffers(offersData);
          
          let totalApps = 0;
          for (const offer of offersData) {
            const apps = await jobsService.getApplications(offer.id);
            totalApps += apps.length;
          }
          setApplicationsCount(totalApps);
        } catch (err: any) {
          console.error("Dashboard fetch error:", err);
          // Optional: toast or set error state
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const stats = [
    { 
      label: 'Active Offers', 
      value: loading ? '...' : offers.length.toString(), 
      icon: <Briefcase size={22} className="text-blue-600 dark:text-blue-400" />, 
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      description: 'Jobs currently live'
    },
    { 
      label: 'Total Applications', 
      value: loading ? '...' : applicationsCount.toString(), 
      icon: <Users size={22} className="text-emerald-600 dark:text-emerald-400" />, 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      description: 'Candidates reached'
    },
    { 
      label: 'Pending Reviews', 
      value: '---', 
      icon: <Clock size={22} className="text-amber-600 dark:text-amber-400" />, 
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      description: 'Needs your attention'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">Welcome, Company Admin</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your recruitment process and find your next star hire.</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg px-8 py-6 text-lg rounded-xl transition-all hover:scale-105 active:scale-95" asChild>
          <Link to="/company/offers"><Plus size={20} className="mr-2 stroke-[3px]" /> Post a New Job</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="flex items-center gap-6 p-8 relative">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${s.bg}`}>
                {s.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-heading font-black text-foreground tracking-tight">{s.value}</span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">{s.label}</span>
                <span className="text-xs text-muted-foreground/60 mt-1">{s.description}</span>
              </div>
              <TrendingUp size={48} className="absolute -bottom-2 -right-2 text-foreground/[0.03] rotate-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8">
        <Card className="border-none bg-card shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-8 py-6">
            <div>
              <CardTitle className="font-heading text-2xl font-bold">Recent Job Postings</CardTitle>
              <CardDescription>The latest roles you've published</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 rounded-full px-4" asChild>
              <Link to="/company/offers">View all <ArrowRight size={16} className="ml-2" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
                <p className="text-sm text-muted-foreground">Fetching your job offers...</p>
              </div>
            ) : offers.length > 0 ? (
              <div className="divide-y">
                {offers.slice(0, 4).map(offer => (
                  <div key={offer.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                        <Briefcase size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate text-lg">{offer.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                          <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">{offer.domain}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(offer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full font-bold px-4 hover:bg-primary hover:text-white transition-all" asChild>
                      <Link to={`/company/offers/${offer.id}`}>Manage</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-6">
                <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-muted-foreground/20">
                  <FileText size={32} className="text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">No active job offers</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">Create your first offer to start receiving applications from top talent.</p>
                <Button size="sm" asChild><Link to="/company/offers"><Plus size={16} className="mr-2" /> Create Offer</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;

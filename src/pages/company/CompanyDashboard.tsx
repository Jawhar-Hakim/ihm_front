import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsService } from '@/services/jobs.service';
import type { JobOffer } from '@/types';

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const companyId = user?.id || (user as any)?._id;
      if (companyId) {
        try {
          const data = await jobsService.getAll({ societe: companyId });
          setOffers(data);
        } catch (err) {
          console.error(err);
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
    { label: 'Active Offers', value: loading ? '...' : offers.length.toString(), icon: <Briefcase size={22} className="text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Candidates Viewing', value: '12+', icon: <Users size={22} className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'New Applications', value: '0', icon: <FileText size={22} className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Company Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back. Here is what's happening today.</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-sm" asChild>
          <Link to="/company/offers"><Plus size={18} className="mr-2" /> Post New Job</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-5 p-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.bg}`}>
                {s.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-heading font-bold text-foreground">{s.value}</span>
                <span className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-heading text-xl font-bold">My Recent Offers</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" asChild>
              <Link to="/company/offers">View all <ArrowRight size={14} className="ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : offers.length > 0 ? (
              offers.slice(0, 3).map(offer => (
                <div key={offer.id || (offer as any)._id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-semibold text-foreground">{offer.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1"><Briefcase size={12}/> {offer.domain || (offer as any).domaine}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">{new Date(offer.createdAt || (offer as any).datePublication || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/company/offers`}>Manage</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg border-border">
                <FileText size={32} className="mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-foreground font-medium mb-1">No job offers published yet</p>
                <p className="text-muted-foreground text-sm">Create your first offer to start receiving applications.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <Button variant="outline" className="h-16 justify-start px-6 text-base font-medium border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all group" asChild>
              <Link to="/company/offers">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                  <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Manage Job Offers
              </Link>
            </Button>
            <Button variant="outline" className="h-16 justify-start px-6 text-base font-medium border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all group" asChild>
              <Link to="/company/candidates">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mr-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors">
                  <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                Browse Candidates
              </Link>
            </Button>
            <Button variant="outline" className="h-16 justify-start px-6 text-base font-medium border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all group" asChild>
              <Link to="/company/profile">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center mr-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
                  <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                Update Company Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;

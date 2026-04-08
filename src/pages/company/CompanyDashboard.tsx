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
    if (user?.id) {
      jobsService.getAll({ societe: user.id })
        .then(data => setOffers(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const stats = [
    { label: 'Active Offers', value: offers.length.toString(), icon: <Briefcase size={20} />, color: 'text-primary' },
    { label: 'Total Candidates', value: '...', icon: <Users size={20} />, color: 'text-secondary' },
    { label: 'New Applications', value: '...', icon: <FileText size={20} />, color: 'text-accent' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">Manage your recruitment pipeline.</p>
        </div>
        <Button asChild>
          <Link to="/company/offers"><Plus size={16} className="mr-2" /> Post New Job</Link>
        </Button>
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
            <CardTitle className="font-heading text-lg">My Recent Offers</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/company/offers">Manage all <ArrowRight size={14} /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
            ) : offers.length > 0 ? (
              offers.slice(0, 3).map(offer => (
                <div key={offer.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium text-sm">{offer.title}</div>
                    <div className="text-xs text-muted-foreground">{offer.domain} · {new Date(offer.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/company/offers`}>Details</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No job offers published yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/company/offers"><Briefcase size={16} className="mr-2" /> Manage Job Offers</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/company/candidates"><Users size={16} className="mr-2" /> Browse Candidates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;

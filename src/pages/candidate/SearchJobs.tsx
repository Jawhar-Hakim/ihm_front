import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Briefcase, MapPin, Loader2 } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { JobOffer } from '@/types';

const SearchJobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    jobsService.getAll()
      .then(data => setJobs(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleApply = async (jobId: string) => {
    if (!user?.id) return;
    setApplying(jobId);
    try {
      await jobsService.apply(jobId, { candidateId: user.id });
      toast({ title: 'Success', description: 'Application submitted successfully!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to apply', variant: 'destructive' });
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input 
          placeholder="Search jobs by title, skills, or company..." 
          className="pl-10 h-12 text-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <Card key={job.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-heading font-bold text-xl">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 size={14} /> {job.companyName}</span>
                        <span className="flex items-center gap-1"><Briefcase size={14} /> {job.domain}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                    </div>
                    <Button onClick={() => handleApply(job.id)} disabled={applying === job.id}>
                      {applying === job.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
              <div className="text-muted-foreground mb-2">No job offers found matching your search.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Internal icon fix
const Building2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;

export default SearchJobs;

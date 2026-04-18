import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, MapPin, Briefcase } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { JobOffer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const SearchJobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  // Filters State
  const [keyword, setKeyword] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    jobsService.getAll()
      .then(data => setJobs(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleApply = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setApplying(jobId);
    try {
      await jobsService.apply(jobId, { candidateId: user.id });
      toast({ title: 'Success', description: 'Application submitted successfully!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to apply', variant: 'destructive' });
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(job => {
      const matchKeyword = keyword ? (job.title?.toLowerCase().includes(keyword.toLowerCase()) || 
                           job.description?.toLowerCase().includes(keyword.toLowerCase())) : true;
      const matchDomain = domainFilter ? job.domain?.toLowerCase() === domainFilter.toLowerCase() : true;
      const matchSpecialty = specialtyFilter ? job.specialty?.toLowerCase() === specialtyFilter.toLowerCase() : true;
      
      return matchKeyword && matchDomain && matchSpecialty;
    });

    if (sortBy === 'newest') {
      result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      result = result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    return result;
  }, [jobs, keyword, domainFilter, specialtyFilter, sortBy]);

  const domains = Array.from(new Set(jobs.map(j => j.domain).filter(Boolean)));
  const specialties = Array.from(new Set(jobs.map(j => j.specialty).filter(Boolean)));

  const formatRelativeDate = (dateString: string) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference === 0 ? 'Today' : rtf.format(daysDifference, 'day');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center w-full">
      {/* Hero Section */}
      <div className="w-full bg-primary py-16 md:py-24 px-4 text-center text-primary-foreground flex flex-col items-center justify-center pt-24 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Jobs for <span className="text-amber-500">Global</span> Professionals
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
          Find your next dream role tailored to your skills and preferences.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row w-full max-w-3xl mx-auto bg-transparent md:bg-white rounded-lg md:rounded-full md:p-1 overflow-hidden md:border-2 border-white/20 gap-2 md:gap-0">
          <div className="relative flex-1 bg-white rounded-lg md:rounded-none overflow-hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Search jobs by title, organization, or keyword..." 
              className="pl-12 h-14 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground bg-white w-full rounded-none"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <Button 
            className="md:rounded-full rounded-lg h-14 px-10 text-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shrink-0 w-full md:w-auto"
            onClick={() => {}}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl px-4 py-8 mx-auto -mt-6 rounded-t-3xl bg-background relative z-10">
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-8 border-b border-border/50 justify-center sm:justify-start">
          <select 
            className="h-10 px-4 py-2 border rounded-full text-sm bg-background text-foreground/80 hover:bg-muted/50 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
            value={domainFilter} 
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="">Domain</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          <select 
            className="h-10 px-4 py-2 border rounded-full text-sm bg-background text-foreground/80 hover:bg-muted/50 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
            value={specialtyFilter} 
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="">Specialty</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="h-10 px-4 py-2 border rounded-full text-sm bg-background text-foreground/80 hover:bg-muted/50 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>

         
        </div>

        {/* Job List Header */}
        <div className="grid grid-cols-12 gap-4 pb-3 border-border/80 border-b-2 font-bold text-xs tracking-wider text-muted-foreground">
          <div className="col-span-8 md:col-span-4">JOB PROFILE</div>
          <div className="hidden md:block md:col-span-4">DESCRIPTION</div>
          <div className="col-span-4 md:col-span-4 text-right md:text-left flex justify-end md:justify-between px-2">
            <span className="hidden md:inline-block">POSTED</span>
            <span>DOMAIN / ACTION</span>
          </div>
        </div>

        {/* Job Listings */}
        <div className="flex flex-col mt-2">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
          ) : filteredJobs.length > 0 ? (
             filteredJobs.map(job => (
              <div key={job.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b border-border/40 hover:bg-muted/20 transition-colors px-2 group">
                {/* Title and Company */}
                <div className="col-span-1 md:col-span-4 pr-4">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer mb-1 line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    {job.companyName || 'Company'}
                  </div>
                  {job.specialty && (
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs py-0.5 bg-muted font-medium uppercase tracking-wide text-muted-foreground">
                        {job.specialty}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Description Column */}
                <div className="col-span-1 md:col-span-4 hidden md:block pr-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {job.description || "No description provided."}
                  </p>
                </div>
                
                {/* Right Side Info */}
                <div className="col-span-1 md:col-span-4 flex flex-row items-center justify-between mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/40">
                  <div className="text-sm text-foreground/70 hidden md:block shrink-0">
                    {formatRelativeDate(job.createdAt)}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 flex-1 md:flex-none w-full md:w-auto overflow-hidden">
                    {/* Domain badge simulating location in the image */}
                    {job.domain && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1 hidden lg:flex truncate max-w-[120px]">
                        <Briefcase size={14} className="opacity-50 shrink-0" />
                        <span className="truncate">{job.domain}</span>
                      </span>
                    )}
                    
                    <Button 
                      size="sm" 
                      onClick={(e) => handleApply(job.id, e)} 
                      disabled={applying === job.id}
                      className="rounded-full shadow-sm shrink-0 ml-auto md:ml-0"
                    >
                      {applying === job.id ? <Loader2 className="animate-spin mr-1 h-3 w-3" /> : null}
                      {applying === job.id ? '...' : 'Apply'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No jobs matched your search</h3>
              <Button variant="link" onClick={() => { setKeyword(''); setDomainFilter(''); setSpecialtyFilter(''); }} className="mt-2">
                Clear all filters
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchJobs;

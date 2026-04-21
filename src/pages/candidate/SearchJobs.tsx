import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, MapPin, Briefcase, Globe, Clock, CheckCircle, Info } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { candidatesService } from '@/services/candidates.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { JobOffer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const SearchJobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingIndicator, setApplyingIndicator] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Filters State
  const [keyword, setKeyword] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsData = await jobsService.getAll();
        setJobs(jobsData);
        
        const userId = user?.id || (user as any)?._id;
        if (userId) {
          try {
            const appsData = await candidatesService.getApplications(userId);
            const appliedIds = new Set(
              Array.isArray(appsData) ? appsData.map((app: any) => app.jobOfferId || app.offre_emploi?._id) : []
            );
            setAppliedJobIds(appliedIds);
            
            const profile = await candidatesService.getProfile(userId).catch(() => null);
            if (profile) setCandidateId(profile.id || profile._id);
          } catch (e) {
            console.error("Failed to fetch applications or profile", e);
          }
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast, user]);

  const handleApply = async () => {
    if (!candidateId) {
      toast({ title: 'Profile required', description: 'Please complete your profile to apply.', variant: 'destructive' });
      return;
    }
    if (!selectedJob) return;
    
    const jobId = selectedJob.id || (selectedJob as any)._id;
    setApplyingIndicator(jobId);
    
    try {
      let cvBase64 = undefined;
      if (cvFile) {
        const reader = new FileReader();
        cvBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(cvFile);
        });
      }

      await jobsService.apply(jobId, { candidateId, cvUrl: cvBase64 });
      setAppliedJobIds(prev => new Set(prev).add(jobId));
      toast({ title: 'Success', description: 'Application submitted successfully!' });
      setSelectedJob(null);
      setCvFile(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to apply', variant: 'destructive' });
    } finally {
      setApplyingIndicator(null);
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

      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl px-4 py-8 mx-auto -mt-6 rounded-t-3xl bg-background relative z-10">
        
        {/* Search Menu */}
        <div className="mb-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search jobs..."
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All domains</option>
              {domains.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>

            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {(keyword || domainFilter || specialtyFilter || sortBy !== 'newest') && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setKeyword('');
                  setDomainFilter('');
                  setSpecialtyFilter('');
                  setSortBy('newest');
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Job Listings Header */}
        <div className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-8 mb-4">
          {filteredJobs.length} OF {jobs.length} POSITIONS AVAILABLE
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {loading ? (
            <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
          ) : filteredJobs.length > 0 ? (
             filteredJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#134e4a]"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 pr-6">
                      {job.title}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1e3a8a] text-white">
                      New
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">{job.companyName || 'Company'}</div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Globe size={14} className="mr-2 text-blue-600" /> {job.domain}
                    </div>
                    {job.specialty && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Briefcase size={14} className="mr-2 text-teal-600" /> {job.specialty}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock size={14} className="mr-2 text-amber-600" /> {job.contractType || 'Full-time'}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                    {job.description || "No description provided."}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3 mt-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedJob(job)}
                  >
                    Details
                  </Button>
                  
                  {appliedJobIds.has(job.id) || appliedJobIds.has((job as any)._id) ? (
                     <Button 
                       disabled
                       className="flex-1 bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed"
                     >
                       Applied <CheckCircle size={14} className="ml-1" />
                     </Button>
                   ) : (
                     <Button 
                       onClick={() => setSelectedJob(job)}
                       className="flex-1 text-[#e8f4f1] transition-colors"
                       style={{ background: 'linear-gradient(135deg, #0f3460 0%, #134e4a 100%)' }}
                     >
                       Apply Now
                     </Button>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <Search size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No jobs matched your search</h3>
              <Button variant="link" onClick={() => { setKeyword(''); setDomainFilter(''); setSpecialtyFilter(''); }} className="mt-2">
                Clear all filters
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Expanded Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedJob?.title || (selectedJob as any)?.titre}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {selectedJob?.companyName || (selectedJob as any)?.societe?.nom || 'Company'} • {selectedJob?.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString() : (selectedJob as any)?.datePublication ? new Date((selectedJob as any).datePublication).toLocaleDateString() : 'Recent'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={14} className="text-blue-600" />
                  <span className="text-xs font-medium uppercase text-gray-500">Domain</span>
                </div>
                <p className="text-sm font-semibold">{selectedJob?.domain || (selectedJob as any)?.domaine}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={14} className="text-teal-600" />
                  <span className="text-xs font-medium uppercase text-gray-500">Specialty</span>
                </div>
                <p className="text-sm font-semibold">{selectedJob?.specialty || (selectedJob as any)?.specialiteName || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-amber-600" />
                  <span className="text-xs font-medium uppercase text-gray-500">Type</span>
                </div>
                <p className="text-sm font-semibold">{selectedJob?.workMode || (selectedJob as any)?.type || 'On-site'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Info size={18} />
                Job Requirements & Details
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selectedJob?.description || (selectedJob as any)?.description}
                {((selectedJob?.description || (selectedJob as any)?.description) && (selectedJob?.contractType || selectedJob?.experienceLevel)) && '\n\n'}
                {selectedJob?.contractType && <>Contract Type: <span className="font-bold text-gray-900 dark:text-white">{selectedJob.contractType}</span>{'\n'}</>}
                {selectedJob?.experienceLevel && <>Experience Level: <span className="font-bold text-gray-900 dark:text-white">{selectedJob.experienceLevel}</span></>}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col justify-center gap-4">
              {appliedJobIds.has(selectedJob?.id || (selectedJob as any)?._id) ? (
                <div className="flex flex-col items-center">
                   <div className="text-emerald-600 font-bold flex items-center justify-center gap-2 mb-2 p-3 bg-emerald-50 rounded-lg w-full">
                     <CheckCircle size={20} /> You have already applied for this position
                   </div>
                </div>
              ) : (
                <>
                  <div className="w-full max-w-sm mx-auto text-center border p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-dashed">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Attach a custom CV for this job (optional)
                    </label>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300"
                    />
                  </div>
                  <Button 
                    onClick={handleApply} 
                    disabled={applyingIndicator !== null}
                    className="px-10 py-3 mx-auto w-1/2 text-base"
                    style={{ background: 'linear-gradient(135deg, #0f3460 0%, #134e4a 100%)' }}
                  >
                    {applyingIndicator !== null ? (
                      <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Applying...</>
                    ) : (
                      'Apply Now'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchJobs;

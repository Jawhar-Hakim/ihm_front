import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Globe, Clock, ArrowLeft, Loader2, X, Info, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { jobsService } from '@/services/jobs.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { JobOffer } from '@/types';

const JobOffers: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [applying, setApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    jobsService.getAll()
      .then(data => setJobOffers(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load job offers', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const getDateKey = (job: JobOffer) => {
    const rawDate = job.createdAt || (job as any).datePublication;
    if (!rawDate) return '';
    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) return '';
    return parsedDate.toISOString().slice(0, 10);
  };

  const domainOptions = useMemo(() => {
    return [...new Set(jobOffers.map(job => job.domain || (job as any).domaine).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [jobOffers]);

  const companyOptions = useMemo(() => {
    return [...new Set(jobOffers.map(job => job.companyName || (job as any).societe?.nom || 'Company').filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [jobOffers]);

  const filteredJobOffers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return jobOffers.filter((job) => {
      const title = (job.title || (job as any).titre || '').toLowerCase();
      const description = (job.description || (job as any).description || '').toLowerCase();
      const domain = (job.domain || (job as any).domaine || '').toLowerCase();
      const specialty = (job.specialty || (job as any).specialiteName || '').toLowerCase();
      const company = (job.companyName || (job as any).societe?.nom || 'Company').toLowerCase();

      const matchesSearch = !normalizedSearch
        || title.includes(normalizedSearch)
        || description.includes(normalizedSearch)
        || domain.includes(normalizedSearch)
        || specialty.includes(normalizedSearch)
        || company.includes(normalizedSearch);

      const matchesDate = !selectedDate || getDateKey(job) === selectedDate;
      const matchesDomain = !selectedDomain || (job.domain || (job as any).domaine) === selectedDomain;
      const matchesCompany = !selectedCompany || (job.companyName || (job as any).societe?.nom || 'Company') === selectedCompany;

      return matchesSearch && matchesDate && matchesDomain && matchesCompany;
    });
  }, [jobOffers, searchTerm, selectedDate, selectedDomain, selectedCompany]);

  const handleApply = async () => {
    if (!user?.id) {
      navigate('/register?role=candidate');
      return;
    }
    if (!selectedJob) return;
    setApplying(true);
    try {
      const jobId = selectedJob.id || (selectedJob as any)._id;
      await jobsService.apply(jobId, { candidateId: user.id || (user as any)._id });
      toast({ title: 'Success', description: 'Application submitted successfully!' });
      setSelectedJob(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to apply', variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">

      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="container mx-auto px-6 lg:px-12 py-5">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon" className="border-gray-300 dark:border-slate-700">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase size={24} className="text-blue-900 dark:text-blue-400" />
                Available Job Offers
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Discover opportunities that match your skills
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 container mx-auto px-6 lg:px-12 py-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin h-7 w-7 text-gray-400" />
          </div>
        ) : jobOffers.length > 0 ? (
          <>
            <div className="mb-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All domains</option>
                  {domainOptions.map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>

                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All companies</option>
                  {companyOptions.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              {(searchTerm || selectedDate || selectedDomain || selectedCompany) && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDate('');
                      setSelectedDomain('');
                      setSelectedCompany('');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X size={13} /> Clear filters
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 tracking-wide uppercase">
              {filteredJobOffers.length} of {jobOffers.length} positions available
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobOffers.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-colors duration-200 flex flex-col overflow-hidden"
                >
                  {/* Accent stripe */}
                  <div className="h-[3px] bg-gradient-to-r from-[#0f3460] to-[#134e4a]" />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Title + Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {job.title || (job as any).titre}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {job.companyName || (job as any).societe?.nom || 'Company'}
                        </p>
                      </div>
                      <span className="ml-3 flex-shrink-0 text-[11px] font-medium bg-[#0f3460] text-[#b8cfee] px-2.5 py-0.5 rounded-full">
                        New
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-3 flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Globe size={13} className="text-blue-900 dark:text-blue-500 flex-shrink-0" />
                        <span className="truncate">{job.domain || (job as any).domaine}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Briefcase size={13} className="text-teal-900 dark:text-teal-600 flex-shrink-0" />
                        <span className="truncate">{job.specialty || (job as any).specialiteName || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={13} className="text-amber-700 dark:text-amber-600 flex-shrink-0" />
                        <span>{job.workMode || (job as any).type || 'Full-time'}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                      {job.description || (job as any).description}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="flex-1 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Details
                      </button>
                      <Link
                        to="/register?role=candidate"
                        className="flex-1 py-2 text-xs font-medium rounded-lg text-center text-[#e8f4f1] transition-colors"
                        style={{ background: 'linear-gradient(135deg, #0f3460 0%, #134e4a 100%)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #1a4a80 0%, #1a6b62 100%)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #0f3460 0%, #134e4a 100%)')}
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobOffers.length === 0 && (
              <div className="text-center py-16 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl mt-5">
                <p className="text-sm text-gray-400">No offers match your filters.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
            <p className="text-sm text-gray-400">No job offers available at the moment.</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6 lg:px-12 py-12 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Didn't find what you're looking for?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Register now to get personalized job recommendations based on your skills and preferences.
          </p>
          <Link
            to="/register?role=candidate"
            className="inline-block px-6 py-2.5 text-sm font-medium rounded-lg text-[#e8f4f1] transition-colors"
            style={{ background: 'linear-gradient(135deg, #0f3460 0%, #134e4a 100%)' }}
          >
            Start Your Journey
          </Link>
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
                <p className="text-sm font-semibold">{selectedJob?.workMode || (selectedJob as any)?.type || 'Full-time'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Info size={18} />
                Job Requirements & Details
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {selectedJob?.detailsOffre || (selectedJob as any)?.detailsOffre}
                {((selectedJob?.detailsOffre || (selectedJob as any)?.detailsOffre) && selectedJob?.description) && '\n\n'}
                {selectedJob?.description || (selectedJob as any)?.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-center">
              <Button 
                onClick={handleApply} 
                disabled={applying}
                className="px-10 py-3 text-base"
                style={{ background: 'linear-gradient(135deg, #0f3460 0%, #134e4a 100%)' }}
              >
                {applying ? (
                  <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Applying...</>
                ) : (
                  'Apply Now'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobOffers;
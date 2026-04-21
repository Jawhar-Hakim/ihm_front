import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, ArrowLeft, Loader2, Globe, Info } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { JobOffer } from '@/types';

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [customCv, setCustomCv] = useState<string | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    if (!id) return;
    jobsService.getById(id)
      .then(data => setJob(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load job details', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast({ title: 'Invalid File', description: 'Please choose a valid PDF file.', variant: 'destructive' });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please use a PDF under 2MB', variant: 'destructive' });
      return;
    }

    setUploadingCv(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomCv(event.target?.result as string);
        toast({ title: 'Success', description: 'CV uploaded successfully for this application' });
      }
      setUploadingCv(false);
    };
    reader.onerror = () => {
      toast({ title: 'Error', description: 'Failed to read PDF file', variant: 'destructive' });
      setUploadingCv(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    if (!user?.id) {
      navigate('/register?role=candidate');
      return;
    }
    setApplying(true);
    try {
      await jobsService.apply(id || '', { 
        candidateId: user.id,
        cvUrl: customCv || undefined
      });
      toast({ title: 'Success', description: 'Application submitted successfully!' });
      navigate('/jobs');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to apply', variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Job Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The job offer you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/jobs">Back to Job Offers</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="container mx-auto px-6 lg:px-12 py-5">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="border-gray-300 dark:border-slate-700"
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.companyName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            {/* Accent stripe */}
            <div className="h-[4px] bg-gradient-to-r from-[#0f3460] to-[#134e4a]" />

            <div className="p-8">
              {/* Meta Info */}
              <div className="grid sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-blue-900 dark:text-blue-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Domain</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.domain}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={16} className="text-teal-900 dark:text-teal-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Specialty</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.specialty || 'Not specified'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-amber-700 dark:text-amber-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{job.workMode || 'Full-time'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info size={18} />
                  Job Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800">
                {job.experienceLevel && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Experience Level</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.experienceLevel}</p>
                  </div>
                )}
                {job.educationLevel && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Education Level</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.educationLevel}</p>
                  </div>
                )}
                {job.contractType && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Contract Type</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.contractType}</p>
                  </div>
                )}
                {job.responsibilities && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Responsibilities</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.responsibilities}</p>
                  </div>
                )}
              </div>

              {/* CV Upload Section */}
              {user?.id && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Application Document</h3>
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      By default, we will use the CV from your profile. Upload a different one for this specific application if needed.
                    </p>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="customCv" 
                        accept="application/pdf"
                        onChange={handleCvUpload}
                        className="hidden" 
                      />
                      <label 
                        htmlFor="customCv" 
                        className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                          customCv ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' : 
                          'border-gray-300 dark:border-slate-700 hover:border-blue-500 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {uploadingCv ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                            <span className="text-sm font-medium">{customCv ? 'Custom CV Attached' : 'Upload Specific CV (Optional)'}</span>
                          </div>
                        )}
                      </label>
                      {customCv && (
                        <button 
                          onClick={() => setCustomCv(null)}
                          className="absolute -top-2 -right-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full p-1 text-gray-400 hover:text-red-500 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/jobs')}
                  className="border-gray-300 dark:border-slate-700"
                >
                  Back to Offers
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={applying}
                  className="px-5"
                  style={{ background: 'linear-gradient(135deg, #0f3460 0%, #134e4a 100%)' }}
                >
                  {applying ? (
                    <>
                      <Loader2 className="animate-spin mr-1 h-4 w-4" />
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Related Info */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Tip:</strong> Make sure to carefully review all job details before applying. You can save this job and come back to it later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

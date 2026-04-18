import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Loader2, Briefcase, Building2, MapPin, Target, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesService } from '@/services/candidates.service';
import { jobsService } from '@/services/jobs.service';
import type { Application, Candidate, JobOffer } from '@/types';
import { Progress } from '@/components/ui/progress';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [appsData, profileData, jobsData] = await Promise.all([
          candidatesService.getApplications(user.id).catch(() => []),
          candidatesService.getProfile(user.id).catch(() => null),
          jobsService.getAll().catch(() => [])
        ]);
        setApplications(appsData);
        setProfile(profileData);
        // Simple recommendation logic: last 4 jobs
        setRecommendedJobs(jobsData.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = ['firstName', 'lastName', 'government', 'category', 'cvUrl', 'diplomas'];
    const filled = fields.filter(field => {
      const val = (profile as any)[field];
      if (Array.isArray(val)) return val.length > 0;
      return !!val;
    }).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Welcome back, {profile?.firstName || user?.name || 'there'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground w-full max-w-xl">
            Ready to take the next step in your career? Check out new job openings and track your applications.
          </p>
        </div>
        <Button size="lg" className="rounded-full shadow-md shrink-0 px-8" asChild>
          <Link to="/candidate/jobs">Explore Jobs <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Activity & Profile */}
        <div className="space-y-8 lg:col-span-1">
          {/* Profile Completion */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-foreground/80 font-medium">
              <Target size={20} className="text-primary" />
              Profile Strength
            </div>
            <Progress value={completionPercentage} className="h-2.5 mb-3" />
            <div className="flex justify-between items-end mb-4">
              <span className="text-3xl font-bold">{completionPercentage}%</span>
              <span className="text-sm font-medium text-muted-foreground">
                {completionPercentage === 100 ? 'All set!' : 'Almost there'}
              </span>
            </div>
            {completionPercentage < 100 && (
              <Button variant="secondary" className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary/15" asChild>
                <Link to="/candidate/profile">Complete Profile</Link>
              </Button>
            )}
          </div>

          {/* Quick Stats overview */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Your Activity</h3>
            
            <Link to="/candidate/applications" className="group flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="font-medium">Applied Jobs</p>
                  <p className="text-sm text-muted-foreground">Track statuses</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{applications.length}</span>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>

            <Link to="/candidate/applications" className="group flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Target size={20} />
                </div>
                <div>
                  <p className="font-medium">Interviews</p>
                  <p className="text-sm text-muted-foreground">Coming up</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{applications.filter(a => a.status === 'accepted').length}</span>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Recommended Jobs feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recommended for you</h2>
            <Button variant="link" className="text-primary" asChild>
              <Link to="/candidate/jobs">View all</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map(job => (
                <Link key={job.id} to="/candidate/jobs" className="block outline-none">
                  <Card className="rounded-2xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex gap-5">
                        {/* Fake Company Logo placeholder */}
                        <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted border">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-lg font-semibold leading-none group-hover:text-primary">{job.title}</h3>
                              <p className="text-muted-foreground mt-1.5 font-medium">{job.companyName}</p>
                            </div>
                            {job.createdAt && (
                              <span className="text-xs text-muted-foreground shrink-0 mt-1">
                                {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-1">
                            {job.domain && <span className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-0.5"><Briefcase size={14}/> {job.domain}</span>}
                            {job.workMode && <span className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-0.5"><MapPin size={14}/> {job.workMode}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-16 text-muted-foreground bg-muted/20 border-2 border-dashed rounded-2xl">
                <Search size={32} className="mx-auto mb-3 opacity-20" />
                <p>No job recommendations yet.</p>
                <p className="text-sm mt-1">Complete your profile to get personalized matches.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;

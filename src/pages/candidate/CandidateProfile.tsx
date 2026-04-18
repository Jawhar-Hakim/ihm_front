import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesService } from '@/services/candidates.service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, FileText, User, MapPin, GraduationCap, Briefcase, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import type { Candidate } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const CandidateProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialProfile, setInitialProfile] = useState<Partial<Candidate> | null>(null);
  const [profile, setProfile] = useState<Partial<Candidate>>({
    firstName: '',
    lastName: '',
    email: '',
    government: '',
    category: '',
    dateOfBirth: '',
    cvUrl: '',
    portfolioUrl: '',
    diplomas: [],
    description: '',
    experienceYears: '',
  });
  const [newDiploma, setNewDiploma] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    if (user?.id) {
      candidatesService.getProfile(user.id, user.email)
        .then(data => {
          // Normalize diplomas array
          const diplomas = Array.isArray(data.diplomas) ? data.diplomas : (data.diplomas ? [data.diplomas] : []);
          const prof = { ...data, diplomas };
          setProfile(prof);
          setInitialProfile(prof);
        })
        .catch(() => toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  }, [user, toast]);

  const hasChanges = initialProfile ? JSON.stringify(profile) !== JSON.stringify(initialProfile) : false;

  const handleDiscard = () => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.id) {
      toast({ title: 'Error', description: 'Could not identify candidate profile', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await candidatesService.updateProfile(profile.id, profile);
      setInitialProfile(profile);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDiploma = () => {
    if (!newDiploma.trim()) return;
    setProfile(prev => ({
      ...prev,
      diplomas: [...(prev.diplomas || []), newDiploma.trim()]
    }));
    setNewDiploma('');
  };

  const handleRemoveDiploma = (idx: number) => {
    setProfile(prev => ({
      ...prev,
      diplomas: prev.diplomas?.filter((_, i) => i !== idx)
    }));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast({ title: 'Invalid File', description: 'Please choose a valid PDF file.', variant: 'destructive' });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {  // Limit to 2 MB to fit easily
      toast({ title: 'File too large', description: 'Please strictly use a PDF under 2MB', variant: 'destructive' });
      return;
    }

    setUploadingPdf(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfile(prev => ({ ...prev, cvUrl: event.target?.result as string }));
      }
      setUploadingPdf(false);
    };
    reader.onerror = () => {
      toast({ title: 'Error', description: 'Failed to read PDF file', variant: 'destructive' });
      setUploadingPdf(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      <div className="relative">
        {/* Cover Photo Placeholder */}
        <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 w-full rounded-b-[3rem] shadow-sm flex items-end p-8 overflow-hidden relative">
           <svg className="absolute w-full h-full opacity-30 right-[-10%] bottom-[-20%] pointer-events-none scale-150 rotate-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="currentColor" fillOpacity="1" d="M0,192L48,208C96,224,192,256,288,256C384,256,480,224,576,202.7C672,181,768,171,864,181.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        </div>
        
        {/* Avatar */}
        <div className="absolute -bottom-12 left-8 md:left-12 flex items-end space-x-6">
          <div className="h-28 w-28 sm:h-32 sm:w-32 bg-card rounded-full border-4 border-background shadow-md flex items-center justify-center text-4xl text-primary font-bold overflow-hidden ring-4 ring-background z-10">
             {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : <User size={48} />}
          </div>
          <div className="pb-2 hidden sm:block z-10 bg-background/50 backdrop-blur-sm px-4 py-1 rounded-full border">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Your Profile'}
            </h1>
            <p className="text-muted-foreground">{profile.category || 'Build your amazing profile'}</p>
          </div>
        </div>
      </div>

      {/* spacer to make room for avatar */}
      <div className="h-8 sm:h-2" />

      <form onSubmit={handleSave} className="space-y-8 mt-12 sm:mt-8 px-4 sm:px-0">
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl border-transparent shadow-sm ring-1 ring-border/50">
              <CardHeader className="px-6 py-6 pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <span className="p-2 bg-primary/10 rounded-xl text-primary"><User size={20} /></span>
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-4">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">First Name</Label>
                    <Input id="firstName" className="h-12 rounded-xl bg-muted/30 border-muted focus-visible:bg-transparent" value={profile.firstName || ''} onChange={e => setProfile({...profile, firstName: e.target.value})} required />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Last Name</Label>
                    <Input id="lastName" className="h-12 rounded-xl bg-muted/30 border-muted focus-visible:bg-transparent" value={profile.lastName || ''} onChange={e => setProfile({...profile, lastName: e.target.value})} required />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                    <Input id="email" type="email" className="h-12 rounded-xl bg-muted text-muted-foreground cursor-not-allowed border-transparent" value={profile.email || ''} disabled />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="dob" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Birth Date</Label>
                    <Input id="dob" type="date" className="h-12 rounded-xl bg-muted/30 border-muted focus-visible:bg-transparent" value={profile.dateOfBirth?.split('T')[0] || ''} onChange={e => setProfile({...profile, dateOfBirth: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="government" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14}/> Location</Label>
                  <Input id="government" className="h-12 rounded-xl bg-muted/30 border-muted focus-visible:bg-transparent" placeholder="Tell us where you are based..." value={profile.government || ''} onChange={e => setProfile({...profile, government: e.target.value})} />
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card className="rounded-3xl border-transparent shadow-sm ring-1 ring-border/50">
              <CardHeader className="px-6 py-6 pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <span className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Briefcase size={20}/></span>
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-4">
                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 space-y-2.5">
                    <Label htmlFor="category" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Primary Title</Label>
                    <Input 
                      id="category" 
                      className="h-12 rounded-xl bg-muted/30 border-muted focus-visible:bg-transparent text-lg"
                      placeholder="e.g. Senior Frontend Developer" 
                      value={profile.category || ''} 
                      onChange={e => setProfile({...profile, category: e.target.value})} 
                    />
                  </div>
                  <div className="sm:col-span-1 space-y-2.5">
                    <Label htmlFor="experienceYears" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Years Exp.</Label>
                    <Input 
                      type="number"
                      min="0"
                      id="experienceYears" 
                      className="h-12 rounded-xl bg-muted/30 border-muted focus-visible:bg-transparent text-lg"
                      placeholder="e.g. 5" 
                      value={profile.experienceYears || ''} 
                      onChange={e => setProfile({...profile, experienceYears: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2.5 mt-4">
                  <Label htmlFor="description" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">About Me / Description</Label>
                  <textarea 
                    id="description" 
                    className="w-full min-h-[120px] p-4 text-base rounded-xl bg-muted/30 border border-muted focus-visible:bg-transparent focus-visible:outline-none focus:ring-2 focus:border-primary transition-all resize-y"
                    placeholder="Describe your background and what you are looking for..." 
                    value={profile.description || ''} 
                    onChange={e => setProfile({...profile, description: e.target.value})} 
                  />
                  <p className="text-sm text-muted-foreground mt-2">This is the first thing employers see when checking your profile.</p>
                </div>
              </CardContent>
            </Card>

            {/* Education & Diplomas */}
            <Card className="rounded-3xl border-transparent shadow-sm ring-1 ring-border/50">
              <CardHeader className="px-6 py-6 pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><GraduationCap size={20}/></span>
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-4">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Degrees & Certifications</Label>
                  
                  <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-2xl border-muted focus-within:ring-2 ring-primary ring-offset-background transition-all">
                    <Input 
                      className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
                      placeholder="Add a new degree..." 
                      value={newDiploma} 
                      onChange={e => setNewDiploma(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDiploma(); } }}
                    />
                    <Button type="button" size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={handleAddDiploma}><Plus size={20} /></Button>
                  </div>

                  {profile.diplomas && profile.diplomas.length > 0 && (
                    <div className="flex flex-col gap-2 mt-4 max-w-sm">
                      {profile.diplomas.map((diploma, idx) => (
                        <div key={idx} className="flex justify-between items-center group bg-card border shadow-sm px-4 py-3 rounded-2xl">
                          <span className="font-medium text-foreground">{diploma}</span>
                          <button type="button" onClick={() => handleRemoveDiploma(idx)} className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-destructive transition-all">
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Links */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-3xl border-transparent shadow-sm ring-1 ring-border/50 sticky top-6">
              <CardHeader className="px-6 py-6 pb-2 bg-gradient-to-b from-blue-50/50 to-transparent">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><LinkIcon size={20}/></span>
                  Links
                </CardTitle>
                <CardDescription>Vital assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="cvUpload" className="text-sm font-semibold text-foreground">CV / Resume (PDF Only)</Label>
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/40 rounded-xl bg-muted/10 hover:bg-muted/30 hover:border-primary/60 cursor-pointer transition-all relative overflow-hidden group">
                    <input 
                      id="cvUpload" 
                      type="file" 
                      accept="application/pdf"
                      disabled={uploadingPdf}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      onChange={handlePdfUpload} 
                    />
                    {uploadingPdf ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : profile.cvUrl && profile.cvUrl.startsWith('data:application/pdf') ? (
                      <div className="flex flex-col items-center text-emerald-600 gap-2">
                        <FileText size={32} />
                        <span className="text-sm font-medium">CV Uploaded Successfully</span>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground">Click to replace</span>
                      </div>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground gap-2">
                        <FileText size={24} className="group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">Click to upload your CV (.pdf &lt; 2MB)</span>
                      </div>
                    )}
                  </label>
                  
                  {profile.cvUrl && (
                    <div className="mt-2 text-right">
                       {profile.cvUrl.startsWith('data:') ? (
                         <a href={profile.cvUrl} download="Resume.pdf" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                           <LinkIcon size={12}/> Download Current CV
                         </a>
                       ) : (
                         <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                           <LinkIcon size={12}/> View previously linked CV
                         </a>
                       )}
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />

                <div className="space-y-3">
                  <Label htmlFor="portfolioUrl" className="text-sm font-semibold text-foreground">Portfolio or GitHub</Label>
                  <Input 
                    id="portfolioUrl" 
                    type="url" 
                    className="h-12 rounded-xl" 
                    placeholder="https://..." 
                    value={profile.portfolioUrl || ''} 
                    onChange={e => setProfile({...profile, portfolioUrl: e.target.value})} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Action Bar */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-50 animate-in slide-in-from-bottom-8 fade-in opacity-100 duration-300">
            <div className="bg-background/80 backdrop-blur-md border shadow-2xl rounded-full p-2 flex items-center justify-between mx-4">
              <Button variant="ghost" type="button" onClick={handleDiscard} className="rounded-full px-6">Discard</Button>
              <Button type="submit" disabled={saving} className="rounded-full px-8 shadow-sm" size="lg">
                  {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save size={18} className="mr-2" />}
                  Save Changes
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

// Quick fix for X icon not being explicitly imported earlier
const X = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default CandidateProfile;

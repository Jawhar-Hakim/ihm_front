import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Check, X, User, FileText, Calendar, Briefcase, MapPin, Mail, Award, Edit } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { useToast } from '@/hooks/use-toast';
import type { JobOffer, Application } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/services/api';

const CompanyJobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [job, setJob] = useState<JobOffer | null>(null);
  const [rawJob, setRawJob] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<JobOffer>>({});
  const [categories, setCategories] = useState<{_id: string, domaine: string}[]>([]);
  const [specialties, setSpecialties] = useState<{_id: string, name: string, categorie: any}[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [jobData, appsData, cats, specs] = await Promise.all([
        api.get<any>(`/offres-emploi/${id}`),
        jobsService.getApplications(id),
        api.get<any>('/categories'),
        api.get<any>('/specialites')
      ]);
      
      setRawJob(jobData);
      setCategories(Array.isArray(cats) ? cats : (cats.data || []));
      setSpecialties(Array.isArray(specs) ? specs : (specs.data || []));
      
      const mappedJob: JobOffer = {
        id: jobData._id,
        companyId: jobData.societe?._id || jobData.societe,
        companyName: jobData.societe?.nom || 'Company',
        title: jobData.titre,
        description: jobData.description,
        detailsOffre: jobData.detailsOffre,
        domain: jobData.domaine || jobData.categorie?.domaine,
        specialty: jobData.specialiteName || jobData.specialite?.name,
        contractType: jobData.contractType,
        experienceLevel: jobData.experienceLevel,
        workMode: jobData.type || jobData.workMode || jobData.contractType || 'On-site',
        createdAt: jobData.datePublication || jobData.createdAt,
        isActive: true,
      };
      
      setJob(mappedJob);
      setApplications(appsData);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, toast]);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      setUpdatingId(appId);
      await jobsService.updateApplicationStatus(appId, status);
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: status as any } : app
      ));
      toast({ 
        title: status === 'accepted' ? 'Candidate Accepted' : 'Candidate Declined', 
        description: `The application status has been updated to ${status}.` 
      });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditInit = () => {
    if (rawJob) {
      setEditingOffer({
        id: rawJob._id,
        title: rawJob.titre,
        description: rawJob.description,
        detailsOffre: rawJob.detailsOffre,
        domain: rawJob.categorie?._id || rawJob.categorie,
        specialty: rawJob.specialite?._id || rawJob.specialite,
        workMode: rawJob.type || rawJob.workMode || 'On-site',
        contractType: rawJob.contractType,
        experienceLevel: rawJob.experienceLevel,
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingOffer.title || !editingOffer.description || !editingOffer.domain || !editingOffer.specialty) {
        toast({ title: 'Validation Error', description: 'Please fill out all required fields', variant: 'destructive' });
        return;
      }

      setSaving(true);
      await jobsService.update(id!, editingOffer);
      toast({ title: 'Success', description: 'Offer updated successfully' });
      setEditDialogOpen(false);
      fetchDetails(); // Refresh
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save offer', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filteredSpecialties = specialties.filter(s => 
    !editingOffer.domain || (s.categorie?._id || s.categorie) === editingOffer.domain
  );

  const openCV = (cvUrl?: string) => {
    if (!cvUrl) {
      toast({ title: "No CV", description: "This candidate did not provide a CV.", variant: "destructive" });
      return;
    }
    
    if (cvUrl.startsWith('data:') || cvUrl.startsWith('blob:')) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${cvUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        toast({ title: "Popup Blocked", description: "Please allow popups to view the CV.", variant: "destructive" });
      }
    } else {
      let fullUrl = cvUrl;
      if (!cvUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
        fullUrl = `${baseUrl}/${cvUrl.startsWith('/') ? cvUrl.slice(1) : cvUrl}`;
      }
      window.open(fullUrl, '_blank');
    }
  };

  if (loading && !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="text-muted-foreground animate-pulse text-lg">Loading job details and applications...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-24">
        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Job offer not found</h2>
        <p className="text-muted-foreground mb-8">The offer you're looking for might have been deleted or doesn't exist.</p>
        <Button asChild size="lg"><Link to="/company/offers"><ArrowLeft className="mr-2 h-5 w-5"/> Back to Offers</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-primary">
            <Link to="/company/offers"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all offers</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">{job.title}</h1>
            <Badge variant="outline" className="text-sm py-1 px-3 border-primary/20 bg-primary/5 text-primary">
              {job.contractType || 'Full-time'}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin size={18} className="text-primary" /> {job.workMode || 'Remote'}</span>
            <span className="flex items-center gap-2"><Calendar size={18} className="text-primary" /> Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><Award size={18} className="text-primary" /> {job.domain}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleEditInit} className="gap-2">
            <Edit size={16} /> Edit Offer
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Applicants</CardTitle>
                  <CardDescription>Review candidates who applied for this position</CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm h-8 px-4 rounded-full">
                  {applications.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="pl-6">Candidate</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length > 0 ? (
                    applications.map(app => {
                      const candidate = app.candidate as any;
                      const name = candidate?.nom ? `${candidate.prenom} ${candidate.nom}` : 'Potential Candidate';
                      const email = candidate?.email || 'No email provided';
                      
                      return (
                        <TableRow key={app.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{name}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={12} /> {email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-medium">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              <Badge 
                                variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}
                                className={`font-semibold capitalize px-3 py-1 rounded-full w-fit ${
                                  app.status === 'accepted' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                                  app.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''
                                }`}
                              >
                                {app.status}
                              </Badge>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 text-primary justify-start text-xs"
                                onClick={() => openCV(app.cvUrl)}
                              >
                                <FileText size={12} className="mr-1" /> View Resume
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {appStatusToDisplay(app.status) === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800"
                                  onClick={() => handleUpdateStatus(app.id, 'accepted')}
                                  disabled={updatingId === app.id}
                                >
                                  {updatingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} className="mr-1" />}
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:border-red-800"
                                  onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                  disabled={updatingId === app.id}
                                >
                                  {updatingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} className="mr-1" />}
                                  Decline
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-muted-foreground italic">Decision made</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 bg-muted/10">
                        <div className="flex flex-col items-center gap-3">
                          <User size={40} className="text-muted-foreground/40" />
                          <p className="text-muted-foreground font-medium">No applications yet for this position.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <span className="text-sm font-medium text-muted-foreground">Contract</span>
                <span className="font-bold">{job.contractType || 'Full-time'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <span className="text-sm font-medium text-muted-foreground">Work Mode</span>
                <span className="font-bold">{job.workMode || 'Remote'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <span className="text-sm font-medium text-muted-foreground">Experience</span>
                <span className="font-bold">{job.experienceLevel || 'Entry Level'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <span className="text-sm font-medium text-muted-foreground">Specialty</span>
                <span className="font-bold">{job.specialty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge className="bg-emerald-500">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-6 gap-2 bg-muted/30 rounded-xl">
                <span className="text-4xl font-black text-primary">{applications.length}</span>
                <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Applications</span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4 italic">
                {applications.filter(a => appStatusToDisplay(a.status) === 'pending').length} applications awaiting review.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Job Offer</DialogTitle>
            <DialogDescription>
              Update the details for your job posting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input 
                  id="title" 
                  value={editingOffer.title || ''} 
                  onChange={e => setEditingOffer(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workMode">Work Mode</Label>
                <Select 
                  value={editingOffer.workMode || ''} 
                  onValueChange={val => setEditingOffer(p => ({ ...p, workMode: val }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category (Domain)</Label>
                <Select 
                  value={editingOffer.domain || ''} 
                  onValueChange={val => setEditingOffer(p => ({ ...p, domain: val, specialty: '' }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.domaine}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select 
                  value={editingOffer.specialty || ''} 
                  onValueChange={val => setEditingOffer(p => ({ ...p, specialty: val }))}
                  disabled={!editingOffer.domain}
                >
                  <SelectTrigger><SelectValue placeholder={editingOffer.domain ? "Select specialty" : "Select domain first"} /></SelectTrigger>
                  <SelectContent>
                    {filteredSpecialties.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                className="min-h-[150px] resize-none"
                value={editingOffer.description || ''} 
                onChange={e => setEditingOffer(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract">Contract Type</Label>
                <Input 
                  id="contract" 
                  value={editingOffer.contractType || ''} 
                  onChange={e => setEditingOffer(p => ({ ...p, contractType: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Input 
                  id="experience" 
                  value={editingOffer.experienceLevel || ''} 
                  onChange={e => setEditingOffer(p => ({ ...p, experienceLevel: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Update Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper for status matching
const appStatusToDisplay = (status: string) => {
  if (status === 'en_attente' || status === 'pending') return 'pending';
  if (status === 'acceptee' || status === 'accepted') return 'accepted';
  if (status === 'refusee' || status === 'rejected') return 'rejected';
  return status;
};

export default CompanyJobDetails;

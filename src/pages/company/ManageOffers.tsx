import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2, Trash2, Edit, Eye, Briefcase, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobsService } from '@/services/jobs.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { JobOffer } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/services/api';

const ManageOffers: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [categories, setCategories] = useState<{_id: string, domaine: string}[]>([]);
  const [specialties, setSpecialties] = useState<{_id: string, name: string, categorie: any}[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<JobOffer>>({});
  const [actualCompanyId, setActualCompanyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [rawOffers, setRawOffers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const profile = await jobsService.getCompanyProfile(user.id);
          setActualCompanyId(profile._id);
          const response = await api.get<any>('/offres-emploi');
          const allOffers = Array.isArray(response) ? response : (response.data || []);
          const myOffers = allOffers.filter((o: any) => (o.societe?._id || o.societe) === profile._id);
          setRawOffers(myOffers);
          
          const mappedOffers = myOffers.map(jobsService.mapOffer);
          setOffers(mappedOffers);
        }
        
        const [cats, specs] = await Promise.all([
          api.get<any>('/categories'),
          api.get<any>('/specialites')
        ]);
        
        setCategories(Array.isArray(cats) ? cats : (cats.data || []));
        setSpecialties(Array.isArray(specs) ? specs : (specs.data || []));
      } catch (e: any) {
        console.error("Failed to fetch data for ManageOffers:", e);
        toast({ title: 'Error', description: `Failed to load details: ${e.message}`, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);

  const handleEdit = (offer: JobOffer) => {
    const raw = rawOffers.find(o => o._id === offer.id);
    if (raw) {
      setEditingOffer({
        id: raw._id,
        title: raw.titre || '',
        description: raw.description || '',
        detailsOffre: raw.detailsOffre || '',
        domain: raw.categorie?._id || raw.categorie || '',
        specialty: raw.specialite?._id || raw.specialite || '',
        workMode: raw.type || raw.workMode || 'On-site',
        contractType: raw.contractType || '',
        experienceLevel: raw.experienceLevel || '',
      });
      setDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await jobsService.delete(id);
      setOffers(offers.filter(o => o.id !== id));
      toast({ title: 'Success', description: 'Offer deleted successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete offer', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    try {
      if (!actualCompanyId) {
        toast({ title: 'Error', description: 'Company profile not found', variant: 'destructive' });
        return;
      }
      if (!editingOffer.title || !editingOffer.description || !editingOffer.domain || !editingOffer.specialty) {
        toast({ title: 'Validation Error', description: 'Please fill out all required fields', variant: 'destructive' });
        return;
      }

      setSaving(true);
      if (editingOffer.id) {
        await jobsService.update(editingOffer.id, editingOffer);
        toast({ title: 'Success', description: 'Offer updated successfully' });
      } else {
        await jobsService.create({ ...editingOffer, companyId: actualCompanyId });
        toast({ title: 'Success', description: 'Offer created successfully' });
      }
      
      // Refresh offers
      const offersData = await jobsService.getAll({ societe: actualCompanyId });
      setOffers(offersData);
      
      setDialogOpen(false);
      setEditingOffer({});
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save offer', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filteredSpecialties = specialties.filter(s => 
    !editingOffer.domain || (s.categorie?._id || s.categorie) === editingOffer.domain
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">Manage Job Offers</h1>
          <p className="text-muted-foreground mt-1">Create and manage your job postings and find the right talent.</p>
        </div>
        <Button onClick={() => { setEditingOffer({}); setDialogOpen(true); }} className="shadow-md">
          <Plus size={18} className="mr-2" /> New Offer
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
              <p className="text-muted-foreground animate-pulse">Loading your offers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px]">Job Position</TableHead>
                    <TableHead>Domain & Specialty</TableHead>
                    <TableHead>Work Mode</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.length > 0 ? (
                    offers.map(offer => (
                      <TableRow key={offer.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{offer.title}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{offer.contractType || 'Full-time'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{offer.domain}</span>
                            <span className="text-xs text-muted-foreground">{offer.specialty}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <MapPin size={14} className="text-muted-foreground" />
                            {offer.workMode || 'On-site'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {new Date(offer.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild title="View Details">
                              <Link to={`/company/offers/${offer.id}`}><Eye size={18} className="text-primary" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)} title="Edit">
                              <Edit size={18} className="text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(offer.id)} title="Delete">
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Briefcase size={32} className="text-muted-foreground" />
                          </div>
                          <h3 className="font-bold text-xl">No offers yet</h3>
                          <p className="text-muted-foreground max-w-xs mx-auto">Start by creating your first job offer to reach out to potential candidates.</p>
                          <Button variant="outline" onClick={() => { setEditingOffer({}); setDialogOpen(true); }} className="mt-2">
                            <Plus size={16} className="mr-2" /> Create First Offer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingOffer.id ? 'Edit Job Offer' : 'Create New Job Offer'}</DialogTitle>
            <DialogDescription>
              Fill in the details for your job posting. Be as descriptive as possible to attract the best talent.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Senior Software Engineer" 
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
                placeholder="Describe the role, requirements, and what it's like to work at your company..." 
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
                  placeholder="e.g. CDI, Freelance" 
                  value={editingOffer.contractType || ''} 
                  onChange={e => setEditingOffer(p => ({ ...p, contractType: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Input 
                  id="experience" 
                  placeholder="e.g. 3-5 years" 
                  value={editingOffer.experienceLevel || ''} 
                  onChange={e => setEditingOffer(p => ({ ...p, experienceLevel: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editingOffer.id ? 'Update Offer' : 'Publish Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageOffers;

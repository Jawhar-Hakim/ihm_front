import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { JobOffer } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/services/api';

const ManageOffers: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [categories, setCategories] = useState<{_id: string, domaine: string}[]>([]);
  const [specialties, setSpecialties] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<JobOffer>>({});
  const [actualCompanyId, setActualCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          const offersData = await jobsService.getAll({ societe: user.id });
          setOffers(offersData);
          
          const societes = await api.get<any[]>('/societes');
          const currentSociete = societes.find(s => s.compte === user.id || s.email === user?.email || s.compte?._id === user.id);
          if (currentSociete) {
            setActualCompanyId(currentSociete._id);
          }
        }
        const cats = await api.get<any[]>('/categories');
        setCategories(cats);
        const specs = await api.get<any[]>('/specialites');
        setSpecialties(specs);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load details', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);

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
      const companyId = actualCompanyId || user?.id || (user as any)?._id;
      if (!companyId) {
        toast({ title: 'Error', description: 'User not authenticated', variant: 'destructive' });
        return;
      }
      if (!editingOffer.title || !editingOffer.description || !editingOffer.domain || !editingOffer.specialty) {
        toast({ title: 'Validation Error', description: 'Please fill out all required fields (Title, Description, Category, Specialty)', variant: 'destructive' });
        return;
      }

      if (editingOffer.id) {
        await jobsService.update(editingOffer.id, editingOffer);
        setOffers(prev => prev.map(o => o.id === editingOffer.id ? { ...o, ...editingOffer } as JobOffer : o));
        toast({ title: 'Success', description: 'Offer updated successfully' });
      } else {
        const payload = { ...editingOffer, companyId };
        const response = await jobsService.create(payload);
        
        const newOffer = { 
          ...editingOffer, 
          id: (response as any)?._id || (response as any)?.id || Date.now().toString(), 
          companyId, 
          createdAt: new Date().toISOString(), 
          isActive: true 
        } as JobOffer;
        
        setOffers(prev => [...prev, newOffer]);
        toast({ title: 'Success', description: 'Offer created successfully' });
      }
      setDialogOpen(false);
      setEditingOffer({});
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save offer', variant: 'destructive' });
    }
  };

  const openNew = () => { setEditingOffer({}); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-xl font-bold">Manage Job Offers</h1>
        <Button size="sm" onClick={openNew}><Plus size={16} className="mr-2" /> New Offer</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Date Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length > 0 ? (
                  offers.map(offer => (
                    <TableRow key={offer.id || (offer as any)._id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.domain || typeof offer.domain === 'object' ? (offer.domain as any)?.nom : offer.domain}</TableCell>
                      <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingOffer(offer); setDialogOpen(true); }}><Edit size={16} /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(offer.id || (offer as any)._id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No offers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">{editingOffer.id ? 'Edit Offer' : 'New Offer'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={editingOffer.title || ''} onChange={e => setEditingOffer(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={editingOffer.description || ''} onChange={e => setEditingOffer(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category (Domain)</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editingOffer.domain || ''} 
                  onChange={e => setEditingOffer(p => ({ ...p, domain: e.target.value }))}
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.domaine}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editingOffer.specialty || ''} 
                  onChange={e => setEditingOffer(p => ({ ...p, specialty: e.target.value }))}
                >
                  <option value="">Select specialty...</option>
                  {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Contract</Label><Input value={editingOffer.contractType || ''} onChange={e => setEditingOffer(p => ({ ...p, contractType: e.target.value }))} placeholder="CDI, CDD..." /></div>
              <div className="space-y-2"><Label>Experience</Label><Input value={editingOffer.experienceLevel || ''} onChange={e => setEditingOffer(p => ({ ...p, experienceLevel: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Work Mode</Label><Input value={editingOffer.workMode || ''} onChange={e => setEditingOffer(p => ({ ...p, workMode: e.target.value }))} placeholder="Remote, Hybrid..." /></div>
            </div>
            <Button className="w-full" onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageOffers;

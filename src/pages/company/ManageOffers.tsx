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

const ManageOffers: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<JobOffer>>({});

  useEffect(() => {
    if (user?.id) {
      jobsService.getAll({ societe: user.id })
        .then(data => setOffers(data))
        .catch(() => toast({ title: 'Error', description: 'Failed to load offers', variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
    console.log(offers)
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
  const handleSave = () => {
    if (editingOffer.id) {
      setOffers(prev => prev.map(o => o.id === editingOffer.id ? { ...o, ...editingOffer } as JobOffer : o));
      toast({ title: 'Offer updated' });
    } else {
      const newOffer = { ...editingOffer, id: Date.now().toString(), companyId: 'c1', createdAt: new Date().toISOString(), isActive: true } as JobOffer;
      setOffers(prev => [...prev, newOffer]);
      toast({ title: 'Offer created' });
    }
    setDialogOpen(false);
    setEditingOffer({});
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
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.domain}</TableCell>
                      <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(offer.id)}>
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
              <div className="space-y-2"><Label>Domain</Label><Input value={editingOffer.domain || ''} onChange={e => setEditingOffer(p => ({ ...p, domain: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Specialty</Label><Input value={editingOffer.specialty || ''} onChange={e => setEditingOffer(p => ({ ...p, specialty: e.target.value }))} /></div>
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

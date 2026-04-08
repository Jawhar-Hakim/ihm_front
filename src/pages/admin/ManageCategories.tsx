import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  domain: string;
  specialty: string;
}

const MOCK_CATEGORIES: Category[] = [
  { id: '1', domain: 'Technology', specialty: 'Web Development' },
  { id: '2', domain: 'Technology', specialty: 'Data Engineering' },
  { id: '3', domain: 'Technology', specialty: 'DevOps' },
  { id: '4', domain: 'Design', specialty: 'UX Design' },
  { id: '5', domain: 'Design', specialty: 'Graphic Design' },
  { id: '6', domain: 'Marketing', specialty: 'Digital Marketing' },
];

const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newDomain || !newSpecialty) return;
    setCategories(prev => [...prev, { id: Date.now().toString(), domain: newDomain, specialty: newSpecialty }]);
    setNewDomain('');
    setNewSpecialty('');
    setDialogOpen(false);
    toast({ title: 'Category added' });
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Category deleted' });
  };

  // Group by domain
  const grouped = categories.reduce<Record<string, Category[]>>((acc, cat) => {
    (acc[cat.domain] = acc[cat.domain] || []).push(cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Categories</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-2" /> Add Category</Button>
      </div>

      {Object.entries(grouped).map(([domain, cats]) => (
        <Card key={domain}>
          <CardHeader><CardTitle className="font-heading text-lg">{domain}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {cats.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">{cat.specialty}</span>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-8 w-8">
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Add Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Domain</Label><Input value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="e.g. Technology" /></div>
            <div className="space-y-2"><Label>Specialty</Label><Input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder="e.g. Machine Learning" /></div>
            <Button className="w-full" onClick={handleAdd}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCategories;

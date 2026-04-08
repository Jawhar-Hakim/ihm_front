import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, User, FileText } from 'lucide-react';
import { candidatesService } from '@/services/candidates.service';
import { useToast } from '@/hooks/use-toast';
import type { Candidate } from '@/types';

const ViewCandidates: React.FC = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    candidatesService.search()
      .then(data => setCandidates(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load candidates', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const filteredCandidates = candidates.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input 
          placeholder="Search candidates by name, skills, or category..." 
          className="pl-10 h-12"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map(c => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User size={24} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold truncate">{c.firstName} {c.lastName}</h3>
                      <p className="text-sm text-primary font-medium">{c.category || 'Candidate'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.government || 'Location N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
                    <Button variant="outline" size="sm" className="flex-1"><FileText size={14} className="mr-2" /> CV</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">No candidates found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewCandidates;

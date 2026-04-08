import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin.service';
import { User } from '@/types';

const ManageAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    adminService.getAccounts()
      .then(data => setAccounts(data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load accounts', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [toast]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAccounts();
      setAccounts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = accounts.filter(a => {
    const name = a.name || '';
    const email = a.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleActive = async (id: string, activate: boolean) => {
    try {
      if (activate) {
        await adminService.validateAccount(id);
      } else {
        await adminService.deactivateAccount(id);
      }
      
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, isActive: activate } : a));
      toast({ title: activate ? 'Account validated' : 'Account deactivated' });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${activate ? 'validate' : 'deactivate'} account`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Manage Accounts</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="candidate">Candidates</SelectItem>
            <SelectItem value="company">Companies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading accounts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No accounts found matching your criteria.
          </div>
        ) : (
          filtered.map(account => (
            <Card key={account.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-primary text-sm">
                    {(account.name || 'U')[0]}
                  </div>
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">{account.email} · <span className="capitalize">{account.role}</span> · {account.createdAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${account.isActive ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {account.isActive ? 'Active' : 'Pending'}
                  </span>
                  {!account.isActive ? (
                    <Button size="sm" onClick={() => toggleActive(account.id, true)}><Check size={14} className="mr-1" /> Validate</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => toggleActive(account.id, false)}><X size={14} className="mr-1" /> Deactivate</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageAccounts;

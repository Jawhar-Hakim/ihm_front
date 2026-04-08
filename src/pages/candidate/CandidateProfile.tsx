import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesService } from '@/services/candidates.service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import type { Candidate } from '@/types';

const CandidateProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<Candidate>>({
    firstName: '',
    lastName: '',
    email: '',
    government: '',
    category: '',
  });

  useEffect(() => {
    if (user?.id) {
      candidatesService.getProfile(user.id)
        .then(data => setProfile(data))
        .catch(() => toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  }, [user, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      await candidatesService.updateProfile(user.id, profile);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Personal Information</CardTitle>
          <CardDescription>Update your profile details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={profile.firstName || ''} onChange={e => setProfile({...profile, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={profile.lastName || ''} onChange={e => setProfile({...profile, lastName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={profile.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="government">Government / Region</Label>
              <Input id="government" value={profile.government || ''} onChange={e => setProfile({...profile, government: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Professional Category</Label>
              <Input id="category" value={profile.category || ''} onChange={e => setProfile({...profile, category: e.target.value})} />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save size={16} className="mr-2" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateProfile;

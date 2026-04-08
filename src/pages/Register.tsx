import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'company' ? 'company' : 'candidate';
  const [tab, setTab] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({ firstName: '', lastName: '', companyName: '', email: '', password: '', domain: '' });
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (tab === 'candidate') {
        res = await authService.registerCandidate({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        });
      } else {
        res = await authService.registerCompany({
          email: form.email,
          password: form.password,
          name: form.companyName,
          domain: form.domain,
        });
      }

      login(res.user, res.token);
      toast({ title: 'Account created!', description: `Welcome to HireFlow, ${res.user.email}` });
      navigate(tab === 'company' ? '/company' : '/candidate');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Registration failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Briefcase size={22} className="text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-2xl">HireFlow</span>
        </Link>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
            <CardDescription>Join HireFlow today</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="candidate" className="gap-2"><User size={16} /> Candidate</TabsTrigger>
                <TabsTrigger value="company" className="gap-2"><Building2 size={16} /> Company</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="candidate" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input placeholder="John" value={form.firstName} onChange={set('firstName')} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="company" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry / Domain</Label>
                    <Input placeholder="Technology" value={form.domain} onChange={set('domain')} />
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </form>
            </Tabs>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;

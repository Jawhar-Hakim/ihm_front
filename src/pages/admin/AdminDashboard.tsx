import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, FolderTree, Shield, ArrowRight } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage platform accounts and categories.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: '156', icon: <Users size={20} />, color: 'text-primary' },
          { label: 'Pending Validation', value: '8', icon: <Shield size={20} />, color: 'text-warning' },
          { label: 'Categories', value: '12', icon: <FolderTree size={20} />, color: 'text-secondary' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-heading font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">Pending Accounts</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/admin/accounts">View all <ArrowRight size={14} /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'NewStartup Inc.', type: 'Company', date: '2026-03-02' },
              { name: 'Marie Dupont', type: 'Candidate', date: '2026-03-01' },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-sm">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.type} · {a.date}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Validate</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/accounts"><Users size={16} className="mr-2" /> Manage Accounts</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/admin/categories"><FolderTree size={16} className="mr-2" /> Manage Categories</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { candidatesService } from '@/services/candidates.service';
import { Loader2, FileText } from 'lucide-react';
import type { Application } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const Applications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      candidatesService.getApplications(user.id)
        .then(data => setApplications(data))
        .catch(err => console.error('Failed to fetch applications:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.jobTitle || 'Job Offer'}</TableCell>
                    <TableCell>{app.companyName || 'N/A'}</TableCell>
                    <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[app.status] || 'bg-muted'}`}>
                        {app.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Applications;

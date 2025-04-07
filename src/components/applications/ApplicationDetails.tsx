'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ApplicationDetailsProps {
  id: string;
}

export default function ApplicationDetails({ id }: ApplicationDetailsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplication = useCallback(async () => {
    if (!user) {
      toast.error('User not authenticated');
      router.push('/applications');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details');
      router.push('/applications');
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Application deleted successfully');
      router.push('/applications');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-purple-100 text-purple-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'No Response': 'bg-gray-100 text-gray-800'
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Application not found</h2>
        <p className="text-muted-foreground mt-2">
          This application doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button asChild className="mt-4">
          <Link href="/applications">Back to Applications</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link href="/applications" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            ← Back to Applications
          </Link>
          <h1 className="text-3xl font-bold mt-2">{application.company}</h1>
        </div>
        <Badge className={getStatusColor(application.status)}>
          {application.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>Information about your job application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {application.link && (
            <div>
              <h3 className="text-sm font-medium">Application Link</h3>
              <a 
                href={application.link.startsWith('http') ? application.link : `https://${application.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {application.link}
              </a>
            </div>
          )}
          {application.username && (
            <div>
              <h3 className="text-sm font-medium">Username/Email</h3>
              <p>{application.username}</p>
            </div>
          )}
          {application.password && (
            <div>
              <h3 className="text-sm font-medium">Password</h3>
              <p className="text-muted-foreground">••••••••</p>
            </div>
          )}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="outline" className={application.active_apps ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'}>
                {application.active_apps ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Added on {new Date(application.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/applications?edit=${application.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
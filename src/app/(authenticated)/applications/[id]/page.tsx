'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Application, NetworkContact } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { use} from 'react';

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}


export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const id = params.id;
  const { user } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [relatedContacts, setRelatedContacts] = useState<NetworkContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplicationDetails();
    }
  }, [user, id]);

  useEffect(() => {
    if (application?.company) {
      fetchRelatedContacts(application.company);
    }
  }, [application]);

  const fetchApplicationDetails = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      
      setApplication(data as Application);
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details');
      router.push('/applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedContacts = async (company: string) => {
    setIsLoadingContacts(true);
    
    try {
      // Find network contacts that are from the same company
      const { data, error } = await supabase
        .from('network_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .ilike('company', `%${company}%`)
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setRelatedContacts(data as NetworkContact[]);
    } catch (error) {
      console.error('Error fetching related contacts:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

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

  // Get status badge color
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

  const getContactStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Follow-up': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-stone-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Application not found</h2>
        <p className="text-muted-foreground mt-2">The application you're looking for doesn't exist or you don't have access to it.</p>
        <Button asChild className="mt-4">
          <Link href="/applications">Back to Applications</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/applications" className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1">
            ← Back to Applications
          </Link>
          <h1 className="text-3xl font-bold mt-2">{application.company}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(application.status)}>
            {application.status}
          </Badge>
          {application.active_apps ? (
            <Badge variant="outline" className="border-green-500 text-green-700">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gray-400 text-gray-600">
              Inactive
            </Badge>
          )}
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>Information about this job application</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {application.link && (
            <div>
              <h3 className="font-medium text-sm">Application Link</h3>
              <a 
                href={application.link.startsWith('http') ? application.link : `https://${application.link}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {application.link}
              </a>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-sm">Status</h3>
              <p>{application.status}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Activity</h3>
              <p>{application.active_apps ? 'Active Application' : 'Inactive Application'}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm mb-2">Portal Credentials</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs text-stone-500">Username/Email</h4>
                <p>{application.username || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="text-xs text-stone-500">Password</h4>
                <div className="flex items-center gap-2">
                  <p>{application.password ? '••••••••' : 'Not provided'}</p>
                  {application.password && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(application.password);
                        toast.success('Password copied to clipboard');
                      }}
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/applications?edit=${application.id}`);
            }}
          >
            Edit Application
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Application
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Related Contacts</CardTitle>
          <CardDescription>Network contacts at {application.company}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingContacts ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-6 w-6 border-4 border-stone-300 border-t-transparent rounded-full"></div>
            </div>
          ) : relatedContacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedContacts.map(contact => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.role || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getContactStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/network/${contact.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No contacts found at {application.company}</p>
              <Button 
                className="mt-4"
                onClick={() => {
                  router.push(`/network?company=${encodeURIComponent(application.company)}`);
                }}
              >
                Add a Contact at {application.company}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { NetworkContact } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageGenerator } from '@/components/message-generator/MessageGenerator';

interface ContactDetailsProps {
  id: string;
}

export default function ContactDetails({ id }: ContactDetailsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [contact, setContact] = useState<NetworkContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContactDetails = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('network_contacts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      
      setContact(data as NetworkContact);
    } catch (error) {
      console.error('Error fetching contact details:', error);
      toast.error('Failed to load contact details');
      router.push('/network');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    if (user) {
      fetchContactDetails();
    }
  }, [user, fetchContactDetails]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const { error } = await supabase
        .from('network_contacts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Contact deleted successfully');
      router.push('/network');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
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

  if (!contact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Contact not found</h2>
        <p className="text-muted-foreground mt-2">The contact you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Button asChild className="mt-4">
          <Link href="/network">Back to Network</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/network" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            ← Back to Network
          </Link>
          <h1 className="text-3xl font-bold mt-2 text-data-name">{contact.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <MessageGenerator 
            name={contact.name} 
            company={contact.company} 
            role={contact.role} 
            variant="outline" 
          />
          <Badge className={getStatusColor(contact.status)}>
            {contact.status}
          </Badge>
        </div>
      </div>
      
      <Card className="mb-6 border-muted">
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
          <CardDescription>Information about their professional background</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-sm">Company</h3>
            <p className="text-data-company">{contact.company || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">Role</h3>
            <p className="text-data-role">{contact.role || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">Location</h3>
            <p className="text-data-location">{contact.location || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">LinkedIn Profile</h3>
            {contact.linkedin_profile ? (
              <a 
                href={contact.linkedin_profile.startsWith('http') ? contact.linkedin_profile : `https://${contact.linkedin_profile}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-data-link hover:underline"
              >
                View Profile
              </a>
            ) : (
              <p>Not provided</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 border-muted">
        <CardHeader>
          <CardTitle>Contact Timeline</CardTitle>
          <CardDescription>History of interactions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-sm">First Contact</h3>
            <p className="text-data-date">{contact.date_of_first_contact || 'Not recorded'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">Second Contact</h3>
            <p className="text-data-date">{contact.second_contact || 'Not recorded'}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 border-muted">
        <CardHeader>
          <CardTitle>Notes & Action Items</CardTitle>
          <CardDescription>Additional information and next steps</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <h3 className="font-medium text-sm">Notes</h3>
            <p className="whitespace-pre-wrap text-data-notes">{contact.notes || 'No notes recorded'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">Action Items</h3>
            <p className="whitespace-pre-wrap text-data-notes">{contact.action_items || 'No action items recorded'}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/network?edit=${contact.id}`);
            }}
          >
            Edit Contact
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Contact
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
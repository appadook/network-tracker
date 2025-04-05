'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { NetworkContact, Application } from '@/types';
import { MessageGenerator } from '@/components/message-generator/MessageGenerator';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentContacts, setRecentContacts] = useState<NetworkContact[]>([]);
  const [activeApplications, setActiveApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch recent network contacts (limit to 3)
      const { data: contactsData, error: contactsError } = await supabase
        .from('network_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (contactsError) throw contactsError;
      
      // Fetch active applications (limit to 3)
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('active_apps', true)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (applicationsError) throw applicationsError;
      
      setRecentContacts(contactsData || []);
      setActiveApplications(applicationsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get status badge color for network contacts
  const getContactStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Follow-up': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status badge color for applications
  const getAppStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-purple-100 text-purple-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'No Response': 'bg-gray-100 text-gray-800'
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Welcome to your network and application tracker.
          </p>
          <MessageGenerator variant="outline" />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-stone-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Recent Network Contacts Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Network Contacts</h2>
              <Link href="/network">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {recentContacts.length > 0 ? (
                recentContacts.map(contact => (
                  <Card key={contact.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <Badge className={getContactStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                      </div>
                      <CardDescription>{contact.company} • {contact.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {contact.location || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">First Contact:</span> {contact.date_of_first_contact || 'N/A'}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href="/network" className="text-sm text-primary hover:underline">View Details</Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>No Recent Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>You haven't added any network contacts yet.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/network">
                      <Button>Add Your First Contact</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
          
          {/* Active Applications Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Active Applications</h2>
              <Link href="/applications">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {activeApplications.length > 0 ? (
                activeApplications.map(app => (
                  <Card key={app.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg truncate" title={app.company}>
                          {app.company}
                        </CardTitle>
                        <Badge className={getAppStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      {app.link && (
                        <CardDescription className="truncate">
                          <a 
                            href={app.link.startsWith('http') ? app.link : `https://${app.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {app.link}
                          </a>
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter>
                      <Link href="/applications" className="text-sm text-primary hover:underline">View Details</Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>No Active Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>You don't have any active job applications yet.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/applications">
                      <Button>Add Your First Application</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
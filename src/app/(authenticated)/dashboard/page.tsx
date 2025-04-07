'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { NetworkContact, Application } from '@/types';
import { MessageGenerator } from '@/components/message-generator/MessageGenerator';
import { NetworkContactCard } from '@/components/network/NetworkContactCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentContacts, setRecentContacts] = useState<NetworkContact[]>([]);
  const [activeApplications, setActiveApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);
  
  // Get status badge color for applications
  const getAppStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Applied': 'bg-blue-700/20 text-blue-400',
      'Interview': 'bg-purple-700/20 text-purple-400',
      'Offer': 'bg-green-700/20 text-green-400',
      'Rejected': 'bg-red-700/20 text-red-400',
      'No Response': 'bg-gray-700/20 text-gray-400'
    };
    
    return statusMap[status] || 'bg-gray-700/20 text-gray-400';
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
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
                  <NetworkContactCard key={contact.id} contact={contact} />
                ))
              ) : (
                <Card className="col-span-3 border-muted">
                  <CardHeader>
                    <CardTitle>No Recent Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>You haven&apos;t added any network contacts yet.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/network">
                      <Button className="bg-primary hover:bg-primary/90 text-white">Add Your First Contact</Button>
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
                  <Card key={app.id} className="bg-card border-muted hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg truncate text-data-company" title={app.company}>
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
                            className="hover:underline text-data-link"
                          >
                            {app.link}
                          </a>
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/applications/${app.id}`} className="text-sm text-primary hover:text-primary/80 hover:underline">View Details</Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="col-span-3 border-muted">
                  <CardHeader>
                    <CardTitle>No Active Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>You don&apos;t have any active job applications yet.</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/applications">
                      <Button className="bg-primary hover:bg-primary/90 text-white">Add Your First Application</Button>
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
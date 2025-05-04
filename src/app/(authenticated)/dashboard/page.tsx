'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { NetworkContact, Application } from '@/types';
import { MessageGenerator } from '@/components/message-generator/MessageGenerator';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';

// Helper function to get formatted date string (YYYY-MM-DD) for input fields
// const getFormattedDate = (date: Date) => {
//   return date.toISOString().split('T')[0];
// };

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentContacts, setRecentContacts] = useState<NetworkContact[]>([]);
  const [activeApplications, setActiveApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit state
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAppDialogOpen, setIsAppDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<NetworkContact | null>(null);
  const [currentApp, setCurrentApp] = useState<Application | null>(null);

  // Form state for contacts
  const [contactFormData, setContactFormData] = useState({
    name: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Follow-up',
    company: '',
    role: '',
    linkedin_profile: '',
    location: '',
    date_of_first_contact: '',
    second_contact: '',
    notes: '',
    action_items: ''
  });

  // Form state for applications
  const [appFormData, setAppFormData] = useState({
    company: '',
    link: '',
    active_apps: true,
    status: 'Applied' as 'Connected' | 'Need Referral' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'No Response',
    username: '',
    password: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Fetch recent network contacts (increased limit to 8)
      const { data: contactsData, error: contactsError } = await supabase
        .from('network_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (contactsError) throw contactsError;

      // Fetch active applications (increased limit to 8)
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('active_apps', true)
        .order('created_at', { ascending: false })
        .limit(8);

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

  // Handle contact edit open
  const handleEditContact = (contact: NetworkContact) => {
    setCurrentContact(contact);
    setContactFormData({
      name: contact.name,
      status: contact.status,
      company: contact.company,
      role: contact.role,
      linkedin_profile: contact.linkedin_profile,
      location: contact.location,
      date_of_first_contact: contact.date_of_first_contact,
      second_contact: contact.second_contact || '',
      notes: contact.notes,
      action_items: contact.action_items
    });
    setIsContactDialogOpen(true);
  };

  // Handle app edit open
  const handleEditApplication = (app: Application) => {
    setCurrentApp(app);
    setAppFormData({
      company: app.company,
      link: app.link,
      active_apps: app.active_apps,
      status: app.status,
      username: app.username,
      password: app.password
    });
    setIsAppDialogOpen(true);
  };

  // Handle contact form input change
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData({ ...contactFormData, [name]: value });
  };

  // Handle app form input change
  const handleAppInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppFormData({ ...appFormData, [name]: value });
  };

  // Handle contact status change
  const handleContactStatusChange = (value: string) => {
    setContactFormData({
      ...contactFormData,
      status: value as 'Active' | 'Inactive' | 'Follow-up'
    });
  };

  // Handle app status change
  const handleAppStatusChange = (value: string) => {
    setAppFormData({
      ...appFormData,
      status: value as 'Connected' | 'Need Referral' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'No Response'
    });
  };

  // Handle app checkbox change
  const handleAppCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppFormData({ ...appFormData, active_apps: e.target.checked });
  };

  // Save contact changes
  const saveContactChanges = async () => {
    if (!user || !currentContact) return;

    try {
      const { error } = await supabase
        .from('network_contacts')
        .update(contactFormData)
        .eq('id', currentContact.id)
        .select();

      if (error) throw error;

      toast.success('Contact updated successfully');

      // Update the contact in the local state
      setRecentContacts(recentContacts.map(c =>
        c.id === currentContact.id ? {
          ...c,
          ...contactFormData,
          second_contact: contactFormData.second_contact || null,
        } : c
      ));

      // Close dialog and reset state
      setIsContactDialogOpen(false);
      setCurrentContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  };

  // Save application changes
  const saveAppChanges = async () => {
    if (!user || !currentApp) return;

    try {
      const { error } = await supabase
        .from('applications')
        .update(appFormData)
        .eq('id', currentApp.id)
        .select();

      if (error) throw error;

      toast.success('Application updated successfully');

      // Update the application in the local state
      setActiveApplications(activeApplications.map(a =>
        a.id === currentApp.id ? {
          ...a,
          ...appFormData
        } : a
      ));

      // Close dialog and reset state
      setIsAppDialogOpen(false);
      setCurrentApp(null);

      // If app is no longer active, it might disappear from this list
      // so let's refetch to be sure
      if (!appFormData.active_apps) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

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

  // Get status color for contact
  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-700/20 text-green-400';
      case 'Follow-up': return 'bg-blue-700/20 text-blue-400';
      default: return 'bg-gray-700/20 text-gray-400';
    }
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

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {recentContacts.length > 0 ? (
                recentContacts.map(contact => (
                  <Card
                    key={contact.id}
                    className="bg-card text-card-foreground rounded-xl border border-muted shadow-sm hover:border-primary/50 transition-colors flex flex-col max-h-48 relative group"
                  >
                    {/* Edit button appears on hover */}
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="absolute top-2 right-2 bg-secondary/60 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit contact"
                    >
                      <Edit size={16} />
                    </button>

                    {/* Card Header - Compact */}
                    <CardHeader className="px-3 pt-3 pb-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-semibold text-data-name truncate">{contact.name}</h3>
                        <Badge className={getContactStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs truncate mt-0.5">
                        <span className="text-data-company">{contact.company}</span>
                        {contact.company && contact.role && " • "}
                        {contact.role && <span className="text-data-role">{contact.role}</span>}
                      </p>
                    </CardHeader>

                    {/* Card Content */}
                    <CardContent className="px-3 py-1 text-xs">
                      <p className="flex justify-between">
                        <span>
                          <span className="font-medium">Location:</span>
                          <span className="text-data-location ml-1">{contact.location || 'N/A'}</span>
                        </span>
                      </p>
                    </CardContent>

                    {/* Divider Line */}
                    <div className="mx-3 border-t border-border/50 my-1"></div>

                    {/* Card Footer */}
                    <CardFooter className="px-3 py-1 flex justify-between items-center mt-auto">
                      <Link href={`/network/${contact.id}`} className="text-xs text-primary hover:text-primary/80 hover:underline">
                        View Details
                      </Link>
                      <MessageGenerator
                        name={contact.name}
                        company={contact.company}
                        role={contact.role}
                        variant="ghost"
                        size="compact"
                      />
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full border-muted">
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

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {activeApplications.length > 0 ? (
                activeApplications.map(app => (
                  <Card
                    key={app.id}
                    className="bg-card border-muted hover:border-primary/50 transition-colors relative group"
                  >
                    {/* Edit button appears on hover */}
                    <button
                      onClick={() => handleEditApplication(app)}
                      className="absolute top-2 right-2 bg-secondary/60 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit application"
                    >
                      <Edit size={16} />
                    </button>

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
                <Card className="col-span-full border-muted">
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

          {/* Contact Edit Dialog */}
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Make changes to the contact information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={contactFormData.name}
                      onChange={handleContactInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={contactFormData.status}
                      onValueChange={handleContactStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={contactFormData.company}
                      onChange={handleContactInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      value={contactFormData.role}
                      onChange={handleContactInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
                    <Input
                      id="linkedin_profile"
                      name="linkedin_profile"
                      value={contactFormData.linkedin_profile}
                      onChange={handleContactInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={contactFormData.location}
                      onChange={handleContactInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date_of_first_contact">First Contact Date</Label>
                    <Input
                      id="date_of_first_contact"
                      name="date_of_first_contact"
                      type="date"
                      value={contactFormData.date_of_first_contact}
                      onChange={handleContactInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="second_contact">Follow-up Date</Label>
                    <Input
                      id="second_contact"
                      name="second_contact"
                      type="date"
                      value={contactFormData.second_contact}
                      onChange={handleContactInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={contactFormData.notes}
                    onChange={handleContactInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="action_items">Action Items</Label>
                  <Input
                    id="action_items"
                    name="action_items"
                    value={contactFormData.action_items}
                    onChange={handleContactInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveContactChanges}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Application Edit Dialog */}
          <Dialog open={isAppDialogOpen} onOpenChange={setIsAppDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Application</DialogTitle>
                <DialogDescription>
                  Update the details of your job application
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={appFormData.company}
                    onChange={handleAppInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link">Application Link</Label>
                  <Input
                    id="link"
                    name="link"
                    value={appFormData.link}
                    onChange={handleAppInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={appFormData.status}
                      onValueChange={handleAppStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Connected">Connected</SelectItem>
                        <SelectItem value="Need Referral">Need Referral</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Offer">Offer</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="No Response">No Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="active" className="flex items-center gap-2 h-10">
                      <input
                        type="checkbox"
                        id="active_apps"
                        name="active_apps"
                        checked={appFormData.active_apps}
                        onChange={handleAppCheckboxChange}
                        className="rounded border-stone-300 text-stone-600 focus:ring-stone-500 h-4 w-4"
                      />
                      <span>Active Application</span>
                    </Label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username/Email</Label>
                  <Input
                    id="username"
                    name="username"
                    value={appFormData.username}
                    onChange={handleAppInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={appFormData.password}
                    onChange={handleAppInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAppDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveAppChanges}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
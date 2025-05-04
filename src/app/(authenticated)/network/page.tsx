'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { NetworkContact } from '@/types';
import { toast } from 'sonner';
import { NetworkContactCardExpanded } from '@/components/network/NetworkContactCardExpanded';

// Helper function to get formatted date string (YYYY-MM-DD) for input fields
const getFormattedDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to get date a week from provided date
const getDateOneWeekAhead = (date: Date) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + 7);
  return newDate;
};

export default function NetworkPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentContact, setCurrentContact] = useState<NetworkContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active',
    company: '',
    role: '',
    linkedin_profile: '',
    location: '',
    date_of_first_contact: '',
    second_contact: '',
    notes: '',
    action_items: ''
  });

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('network_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { error } = await query;
        
      if (error) throw error;
      
      const { data } = await query;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load your network contacts');
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    fetchContacts();
  }, [user, fetchContacts]);

  const handleAddContact = async () => {
    if (!user) return;
    
    try {
      const newContact = {
        ...formData,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('network_contacts')
        .insert([newContact])
        .select();
        
      if (error) throw error;
      
      toast.success('Contact added successfully');
      setContacts([...(data || []), ...contacts]);
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    }
  };

  const handleEditContact = async () => {
    if (!user || !currentContact) return;
    
    try {
      const { error } = await supabase
        .from('network_contacts')
        .update(formData)
        .eq('id', currentContact.id)
        .select();
        
      if (error) throw error;
      
      toast.success('Contact updated successfully');
      
      // Update the contact in the local state with proper type casting
      setContacts(contacts.map(c => c.id === currentContact.id ? { 
        ...c, 
        name: formData.name,
        status: formData.status as 'Active' | 'Inactive' | 'Follow-up',
        company: formData.company,
        role: formData.role,
        linkedin_profile: formData.linkedin_profile,
        location: formData.location,
        date_of_first_contact: formData.date_of_first_contact,
        second_contact: formData.second_contact || null,
        notes: formData.notes,
        action_items: formData.action_items
      } : c));
      
      resetForm();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setCurrentContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const { error } = await supabase
        .from('network_contacts')
        .delete()
        .eq('id', contactId);
        
      if (error) throw error;
      
      toast.success('Contact deleted successfully');
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const startEdit = (contact: NetworkContact) => {
    setCurrentContact(contact);
    setFormData({
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
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    // Get current date for "First Contact" and a week from today for "Second Contact"
    const today = new Date();
    const nextWeek = getDateOneWeekAhead(today);
    
    setFormData({
      name: '',
      status: 'Active',
      company: '',
      role: '',
      linkedin_profile: '',
      location: '',
      date_of_first_contact: getFormattedDate(today),
      second_contact: getFormattedDate(nextWeek),
      notes: '',
      action_items: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as 'Active' | 'Inactive' | 'Follow-up' });
  };
  
  const filteredContacts = contacts.filter(contact => {
    const searchFields = [
      contact.name,
      contact.company,
      contact.role,
      contact.location,
      contact.notes,
      contact.action_items
    ].join(' ').toLowerCase();
    
    return searchFields.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Tracker</h1>
          <p className="text-muted-foreground">
            Manage your professional connections and follow-ups.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (open && !isEditMode) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsEditMode(false);
                setCurrentContact(null);
              }}
            >
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Edit the details of your professional contact.' 
                  : 'Add a new professional contact to your network.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={handleStatusChange}
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
                    value={formData.company} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    name="role" 
                    value={formData.role} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
                  <Input 
                    id="linkedin_profile" 
                    name="linkedin_profile" 
                    value={formData.linkedin_profile} 
                    onChange={handleInputChange} 
                    placeholder="linkedin.com/in/profile"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    placeholder="City, State/Country"
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
                    value={formData.date_of_first_contact} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="second_contact">Follow-up Date</Label>
                  <Input 
                    id="second_contact" 
                    name="second_contact" 
                    type="date" 
                    value={formData.second_contact} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input 
                  id="notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Details about the contact, conversations, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="action_items">Action Items</Label>
                <Input 
                  id="action_items" 
                  name="action_items" 
                  value={formData.action_items} 
                  onChange={handleInputChange} 
                  placeholder="Next steps, follow-up tasks, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={isEditMode ? handleEditContact : handleAddContact}>
                {isEditMode ? 'Save Changes' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-[200px]">
          <Select 
            value={statusFilter} 
            onValueChange={(val) => {
              setStatusFilter(val);
              fetchContacts();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Follow-up">Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <NetworkContactCardExpanded 
              key={contact.id} 
              contact={contact} 
              onEdit={startEdit}
              onDelete={handleDeleteContact}
            />
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg col-span-full">
            <h3 className="text-lg font-medium">No contacts found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || statusFilter
                ? 'Try adjusting your search or filter.'
                : 'Start by adding your professional connections.'}
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                resetForm();
                setIsEditMode(false);
                setCurrentContact(null);
                setIsDialogOpen(true);
              }}
            >
              Add Your First Contact
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
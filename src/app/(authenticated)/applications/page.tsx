'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Application } from '@/types';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentApp, setCurrentApp] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState({
    company: '',
    link: '',
    active_apps: true,
    status: 'Applied',
    username: '',
    password: '',
  });

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load your applications');
    } finally {
      setIsLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [user, fetchApplications]);

  const handleAddApplication = async () => {
    if (!user) return;
    
    try {
      const newApplication = {
        ...formData,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('applications')
        .insert([newApplication])
        .select();
        
      if (error) throw error;
      
      toast.success('Application added successfully');
      fetchApplications(); // Refresh the list
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Failed to add application');
    }
  };

  const handleEditApplication = async () => {
    if (!user || !currentApp) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .update(formData)
        .eq('id', currentApp.id)
        .select();
        
      if (error) throw error;
      
      toast.success('Application updated successfully');
      
      // Update the application in the local state with proper type casting
      setApplications(applications.map(a => a.id === currentApp.id ? { 
        ...a,
        company: formData.company,
        link: formData.link,
        active_apps: formData.active_apps,
        status: formData.status as  'Connected' | 'Need Referral' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'No Response',
        username: formData.username,
        password: formData.password
      } : a));
      
      resetForm();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setCurrentApp(null);
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', appId);
        
      if (error) throw error;
      
      toast.success('Application deleted successfully');
      setApplications(applications.filter(a => a.id !== appId));
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    }
  };

  const startEdit = (app: Application) => {
    setCurrentApp(app);
    setFormData({
      company: app.company,
      link: app.link,
      active_apps: app.active_apps,
      status: app.status,
      username: app.username,
      password: app.password
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      company: '',
      link: '',
      active_apps: true,
      status: 'Applied',
      username: '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, active_apps: e.target.checked });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'No Response' });
  };
  
  const filteredApplications = applications.filter(app => {
    const searchFields = [
      app.company,
      app.link,
      app.username,
    ].join(' ').toLowerCase();
    
    return searchFields.includes(searchQuery.toLowerCase());
  });

  // Get appropriate color for status badges
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Portal</h1>
          <p className="text-muted-foreground">
            Track all your job applications in one place.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsEditMode(false);
                setCurrentApp(null);
              }}
            >
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Application' : 'Add New Application'}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? 'Update the details of your job application.' 
                  : 'Track a new job application.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  name="company" 
                  value={formData.company} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link">Application Link</Label>
                <Input 
                  id="link" 
                  name="link" 
                  value={formData.link} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                      checked={formData.active_apps} 
                      onChange={handleCheckboxChange}
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
                  value={formData.username} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                />
                <p className="text-xs text-muted-foreground">
                  Password is stored securely. Use this to save the password you created for this job portal.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={isEditMode ? handleEditApplication : handleAddApplication}>
                {isEditMode ? 'Save Changes' : 'Add Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search applications..."
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
              fetchApplications();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="No Response">No Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="flex justify-center py-8 col-span-full">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <Card key={app.id} className="overflow-hidden flex flex-col border-muted hover:border-primary/50 transition-colors">
              <CardHeader 
                className="pb-2 bg-card"
                onClick={() => router.push(`/applications/${app.id}`)} 
                style={{ cursor: 'pointer' }}
              >
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate text-data-company" title={app.company}>{app.company}</CardTitle>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status}
                  </Badge>
                </div>
                {app.link && (
                  <CardDescription className="truncate mt-1">
                    <a 
                      href={app.link.startsWith('http') ? app.link : `https://${app.link}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-data-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {app.link}
                    </a>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                <div className="space-y-2">
                  {app.username && (
                    <div>
                      <p className="text-sm font-medium">Username/Email:</p>
                      <p className="text-sm text-data-username truncate">
                        {app.username}
                      </p>
                    </div>
                  )}
                  {app.password && (
                    <div>
                      <p className="text-sm font-medium">Password:</p>
                      <p className="text-sm text-muted-foreground">
                        ••••••••
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Status:</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {app.active_apps ? 'Active Application' : 'Inactive Application'}
                      </p>
                      <Badge variant="outline" className={app.active_apps ? 'border-green-500 text-green-400' : 'border-gray-400 text-gray-400'}>
                        {app.active_apps ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/applications/${app.id}`)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(app);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteApplication(app.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg col-span-full">
            <h3 className="text-lg font-medium">No applications found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || statusFilter
                ? 'Try adjusting your search or filter.'
                : 'Start tracking your job applications.'}
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                resetForm();
                setIsEditMode(false);
                setCurrentApp(null);
                setIsDialogOpen(true);
              }}
            >
              Add Your First Application
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
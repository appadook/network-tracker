'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MessageSquarePlus } from 'lucide-react';

interface MessageGeneratorProps {
  name?: string;
  company?: string;
  role?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'compact';
}

export function MessageGenerator({ 
  name = '', 
  company = '', 
  role = '', 
  variant = 'default',
  size = 'default'
}: MessageGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name,
    company,
    role,
  });

  const generateLinkedInConnectMessage = () => {
    return `Hi ${formData.name},

I noticed your profile as ${formData.role ? `a ${formData.role}` : 'someone who works'} at ${formData.company}. I'm interested in learning more about your experience there and would love to connect professionally.

Best regards,
Kurtik`;
  };

  const generateFollowUpMessage = () => {
    return `Hi ${formData.name},

Thank you for connecting with me! I really appreciate it.

I'm particularly interested in your experience ${formData.role ? `as a ${formData.role}` : ''} at ${formData.company}. Would you be open to a brief chat about your career path and insights into the industry?

Looking forward to hearing from you!

Best regards,
Kurtik`;
  };

  const generateRecruiterEmail = () => {
    return `Subject: Recently Applied for ${formData.role || 'Position'} at ${formData.company}

    Dear ${formData.name},

    I hope this email finds you well. My name is Kurtik, and I'm reaching out regarding my recent application for ${formData.role ? `the ${formData.role} position` : 'a position'} at ${formData.company}.

    I am a Senior Economics and Computer Science double major from Union College, NY with strong skills in data analytics, data engineering, business intelligence, and software development. I believe my interdisciplinary background would be a great fit for ${formData.company} and the role I've applied for.

    I'm particularly excited about this opportunity and would appreciate the chance to discuss how my skills and experience align with what you're looking for. Would it be possible to schedule a brief conversation?

    Thank you for your time and consideration. 

    Best regards,
    Kurtik`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {size === 'compact' ? (
          <Button 
            variant={variant} 
            size="sm" 
            className="p-1 h-auto min-w-0"
            title="Generate messages"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant={variant}>Generate Messages</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Template Messages</DialogTitle>
          <DialogDescription>
            Create personalized message templates for networking and outreach.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid gap-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Contact Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Jane Smith" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  name="company" 
                  value={formData.company} 
                  onChange={handleInputChange} 
                  placeholder="ACME Corp" 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role (Optional)</Label>
              <Input 
                id="role" 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange} 
                placeholder="Senior Software Engineer" 
              />
            </div>
          </div>
          
          <Tabs defaultValue="linkedin" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="linkedin">LinkedIn Connect</TabsTrigger>
              <TabsTrigger value="followup">Follow-Up</TabsTrigger>
              <TabsTrigger value="recruiter">Recruiter Email</TabsTrigger>
            </TabsList>
            <TabsContent value="linkedin" className="border p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">LinkedIn Connection Request</h3>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap text-foreground">
                {generateLinkedInConnectMessage()}
              </pre>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generateLinkedInConnectMessage())}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="followup" className="border p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Follow-Up Message</h3>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap text-foreground">
                {generateFollowUpMessage()}
              </pre>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generateFollowUpMessage())}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="recruiter" className="border p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Recruiter Email</h3>
              <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap text-foreground">
                {generateRecruiterEmail()}
              </pre>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generateRecruiterEmail())}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
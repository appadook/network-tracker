import Link from 'next/link';
import { NetworkContact } from '@/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MessageGenerator } from '../message-generator/MessageGenerator';
import { useRouter } from 'next/navigation';

interface NetworkContactCardExpandedProps {
  contact: NetworkContact;
  onEdit: (contact: NetworkContact) => void;
  onDelete: (id: string) => void;
}

export function NetworkContactCardExpanded({ contact, onEdit, onDelete }: NetworkContactCardExpandedProps) {
  const router = useRouter();
  
  // Helper function for status badge colors
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-700/20 text-green-400';
      case 'Follow-up': return 'bg-blue-700/20 text-blue-400';
      default: return 'bg-gray-700/20 text-gray-400';
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-muted shadow-sm hover:border-primary/50 transition-colors overflow-hidden">
      {/* Card Header - Compact */}
      <div className="px-4 pt-4 pb-2 bg-card">
        <div className="flex justify-between items-start">
          <div>
            <h3 
              className="text-base font-semibold text-data-name cursor-pointer hover:text-primary"
              onClick={() => router.push(`/network/${contact.id}`)}
            >
              {contact.name}
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              <span className="text-data-company">{contact.company}</span>
              {contact.company && contact.role && " • "}
              {contact.role && <span className="text-data-role">{contact.role}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(contact.status)}>
              {contact.status}
            </Badge>
            <MessageGenerator 
              name={contact.name} 
              company={contact.company} 
              role={contact.role} 
              variant="ghost"
              size="compact"
            />
          </div>
        </div>
      </div>
      
      {/* Card Content - Grid Layout */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="font-medium">LinkedIn: </span>
            <span className="text-data-contact">
              {contact.linkedin_profile || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">Location: </span>
            <span className="text-data-location">
              {contact.location || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">First Contact: </span>
            <span className="text-data-date">
              {contact.date_of_first_contact || 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium">Second Contact: </span>
            <span className="text-data-date">
              {contact.second_contact || 'N/A'}
            </span>
          </div>
        </div>
        
        {/* Notes & Action Items - Single Line with Truncation */}
        <div className="mt-2 space-y-1">
          <div className="flex text-xs">
            <span className="font-medium min-w-16">Notes: </span>
            <span className="text-data-notes truncate">
              {contact.notes || 'No notes provided.'}
            </span>
          </div>
          <div className="flex text-xs">
            <span className="font-medium min-w-16">Actions: </span>
            <span className="text-data-notes truncate">
              {contact.action_items || 'No action items.'}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => router.push(`/network/${contact.id}`)}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => onEdit(contact)}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => onDelete(contact.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
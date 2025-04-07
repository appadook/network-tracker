import Link from 'next/link';
import { NetworkContact } from '@/types';
import { Badge } from '../ui/badge';
import { MessageGenerator } from '../message-generator/MessageGenerator';

interface NetworkContactCardProps {
  contact: NetworkContact;
}

export function NetworkContactCard({ contact }: NetworkContactCardProps) {
  // Helper function for status badge colors
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-700/20 text-green-400';
      case 'Follow-up': return 'bg-blue-700/20 text-blue-400';
      default: return 'bg-gray-700/20 text-gray-400';
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-muted shadow-sm hover:border-primary/50 transition-colors flex flex-col max-h-40">
      {/* Card Header - Compact */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold text-data-name truncate">{contact.name}</h3>
          <Badge className={getStatusColor(contact.status)}>
            {contact.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs truncate mt-0.5">
          <span className="text-data-company">{contact.company}</span>
          {contact.company && contact.role && " • "}
          {contact.role && <span className="text-data-role">{contact.role}</span>}
        </p>
      </div>
      
      {/* Card Content - Compact */}
      <div className="px-3 py-1 text-xs">
        <p className="flex justify-between">
          <span>
            <span className="font-medium">Location:</span>
            <span className="text-data-location ml-1">{contact.location || 'N/A'}</span>
          </span>
        </p>
      </div>
      
      {/* Divider Line */}
      <div className="mx-3 border-t border-border/50 my-1"></div>
      
      {/* Card Footer - Compact */}
      <div className="px-3 py-1 flex justify-between items-center mt-auto">
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
      </div>
    </div>
  );
}
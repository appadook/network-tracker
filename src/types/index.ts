export interface NetworkContact {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Follow-up';
  company: string;
  role: string;
  linkedin_profile: string;
  location: string;
  date_of_first_contact: string;
  second_contact: string | null;
  notes: string;
  action_items: string;
  created_at: string;
  user_id: string;
}

export interface Application {
  id: string;
  company: string;
  link: string;
  active_apps: boolean;
  status: 'Connected' | 'Need Referral' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'No Response';
  username: string;
  password: string;
  created_at: string;
  user_id: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}
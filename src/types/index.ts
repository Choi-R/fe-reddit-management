// Shared TypeScript interfaces for the Reddit CRM frontend

export interface User {
  id: string;
  email: string;
  paypal: string | null;
  reddit: string;
  roles: string[];
}

export interface Task {
  id: string;
  subreddit: string | null;
  url: string;
  client_request: string;
  quota: number;
  price: string;
  deadline: string | null;
  type_id: string;
  type_name: string;
  assigned_to_email?: string | null;
  count_incomplete?: number;
  count_pending?: number;
  count_success?: number;
  count_paid?: number;
  count_failed?: number;
}

export interface Booking {
  booking_id: string;
  status_id: string;
  reply_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  task_id: string;
  subreddit: string;
  price: string;
  type_name: string;
}

export interface ActiveBooking {
  booking_id: string;
  status_id: string;
  booked_at: string;
  id: string; // task_id
  subreddit: string | null;
  url: string;
  client_request: string;
  quota: number;
  price: string;
  deadline: string | null;
  type_name: string;
  assigned_to: string | null;
}

export interface BasicUserSummary {
  id: string;
  email: string;
  paypal: string | null;
  reddit: string;
  createdAt: string;
  pendingBalance: number;
  paidBalance: number;
}

export interface PendingSubmission {
  booking_id: string;
  status_id: string;
  reply_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_reddit: string;
  task_id: string;
  subreddit: string;
  price: string;
}

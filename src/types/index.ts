// Shared TypeScript interfaces for the Reddit CRM frontend

export interface User {
  id: string;
  email: string;
  paypal: string | null;
  reddit: string;
  nickname?: string | null;
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
  nickname?: string | null;
  createdAt: string;
  pendingBalance: number;
  paidBalance: number;
  completedCount?: number;
  activeBookingCount?: number;
  pendingReviewCount?: number;
  failedCount?: number;
  tier?: string;
}

export interface UserTaskDetailItem {
  booking_id: string;
  task_id: string;
  status_id: string;
  subreddit: string | null;
  url: string;
  client_request: string;
  price: string;
  deadline?: string | null;
  type_name?: string;
  reply_url?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDetailMetrics {
  activeBookingCount: number;
  pendingReviewCount: number;
  successCount: number;
  paidCount: number;
  failedCount: number;
  completedCount: number;
  totalAttempted: number;
  pendingBalance: number;
  paidBalance: number;
  totalBalance: number;
}

export interface UserDetailStats {
  user: {
    id: string;
    email: string;
    paypal: string | null;
    reddit: string;
    nickname?: string | null;
    createdAt: string;
    tier: string;
    bookingLimit: number;
  };
  metrics: UserDetailMetrics;
  activeBookings: UserTaskDetailItem[];
  pendingSubmissions: UserTaskDetailItem[];
  taskHistory: UserTaskDetailItem[];
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

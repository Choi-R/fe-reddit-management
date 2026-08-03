// Shared TypeScript interfaces for the Reddit CRM frontend

export interface AccountRank {
  id: string; // 'D', 'C', 'B', 'A', 'S'
  rank_name: string; // 'Rank D', 'Rank C', etc.
  cqm_level: string; // 'Lowest', 'Low', 'Moderate', 'High', 'Highest'
  rank_level: number; // 1, 2, 3, 4, 5
}

export interface User {
  id: string;
  email: string;
  paypal: string | null;
  reddit: string;
  nickname?: string | null;
  role_id?: string;
  roles: string[];
  rank_id?: string;
  account_rank?: AccountRank;
}

export interface Task {
  id: string;
  subreddit: string | null;
  url: string;
  client_request: string;
  quota: number;
  original_quota?: number;
  price: string;
  deadline: string | null;
  min_rank_id?: string | null;
  min_rank_name?: string | null;
  min_rank_cqm?: string | null;
  min_rank_level?: number | null;
  assigned_to_email?: string | null;
  deleted_at?: string | null;
  is_archived?: boolean;
  archive_reason?: string;
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
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
  task_id: string;
  subreddit: string;
  price: string;
  min_rank_id?: string | null;
  min_rank_name?: string | null;
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
  min_rank_id?: string | null;
  min_rank_name?: string | null;
  assigned_to: string | null;
}

export interface BasicUserSummary {
  id: string;
  email: string;
  paypal: string | null;
  reddit: string;
  nickname?: string | null;
  roleId?: string;
  rankId: string;
  rankName: string;
  cqmLevel: string;
  rankLevel: number;
  createdAt: string;
  pendingBalance: number;
  paidBalance: number;
  completedCount?: number;
  activeBookingCount?: number;
  pendingReviewCount?: number;
  failedCount?: number;
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
  min_rank_id?: string | null;
  min_rank_name?: string | null;
  reply_url?: string | null;
  note?: string | null;
  admin_note?: string | null;
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
    roleId?: string;
    createdAt: string;
    rankId: string;
    rankName: string;
    cqmLevel: string;
    rankLevel: number;
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

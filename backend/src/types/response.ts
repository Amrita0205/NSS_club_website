export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  pagination?: {
    current: number;
    total: number;
    count: number;
    totalStudents?: number;
    totalEvents?: number;
    totalPending?: number;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}
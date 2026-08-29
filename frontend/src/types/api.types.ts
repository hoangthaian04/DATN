/** Generic paginated response từ Spring Boot Pageable */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

/** Standard error response từ Spring Boot */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
  timestamp?: string;
}

/** Query params cho paginated list */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

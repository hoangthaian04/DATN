/** Standard BaseResponse từ Spring Boot Backend theo quy chuẩn cleanCode.md */
export interface BaseResponse<T = unknown> {
  status: 1 | 0;
  message: string;
  data: T;
}

/** BasePagination bọc danh sách phân trang */
export interface BasePagination<T> {
  current_page: number;
  last_page: number;
  total: number;
  data: T[];
}

/** Standard error response */
export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

/** Query params cho phân trang */
export interface PaginationParams {
  page?: number;
  limit?: number;
  searchText?: string;
  orderBy?: string;
}

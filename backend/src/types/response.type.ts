/**
 * Simple response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}
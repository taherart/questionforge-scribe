
export interface Book {
  id: string;
  name: string;
  grade?: number;
  subject?: string;
  semester?: number;
  total_pages?: number;
  processed_pages?: number;
  status: string;
  questions_count?: number;
  file_path: string;
  created_at: string;
  updated_at: string;
}

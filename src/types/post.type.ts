import { Post } from "@/constants/types";

// Existing CreatePostData type
export interface CreatePostData {
  user_id: string;
  type: string;
  title: string;
  content?: string;
  medias?: string[];
  mediaType?: string;
  tags?: string[];
  status?: string;
}

// Add new type for pagination response
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

// Specific type for post pagination
export type PostPaginatedResponse = PaginatedResponse<Post>;

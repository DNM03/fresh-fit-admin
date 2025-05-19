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

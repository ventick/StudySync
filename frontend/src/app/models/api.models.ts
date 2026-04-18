export interface ApiUser {
  id: number;
  username: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface GroupMember {
  id: number;
  user: number;
  username: string;
  joined_at: string;
}

export interface StudyGroup {
  id: number;
  title: string;
  description: string;
  subject: number;
  subject_details?: Subject;
  creator: number;
  creator_name: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
  members: GroupMember[];
  member_count: number;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface GroupFormPayload {
  title: string;
  description: string;
  subject: number | null;
  max_members: number;
}

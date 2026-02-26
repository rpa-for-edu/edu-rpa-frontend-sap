export interface UserDto {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  language: string;
  provider: string;
  providerId: string | null;
}

export interface UpdateProfileDto {
  name?: string;
  language?: string;
}
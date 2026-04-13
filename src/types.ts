export type Section = 'dashboard' | 'portfolio' | 'profile' | 'branding' | 'opportunities' | 'chat' | 'voice';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface CaseStudy {
  id: string;
  userId: string;
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string;
  tags: string[];
  createdAt: number;
}

export interface ProfileData {
  id: string;
  userId: string;
  platform: string;
  headline: string;
  bio: string;
  skills: string[];
  pricing: string;
  createdAt: number;
}

export interface BrandingAsset {
  id: string;
  userId: string;
  type: 'banner' | 'profile-pic' | 'social-post' | 'video';
  url: string;
  prompt: string;
  caption?: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

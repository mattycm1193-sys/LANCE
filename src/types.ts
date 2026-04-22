export type Section = 'dashboard' | 'portfolio' | 'profile' | 'branding' | 'opportunities' | 'chat' | 'voice';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
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
  externalLink?: string;
  authorExplanation?: string;
  views?: number;
  clicks?: number;
  comments?: Comment[];
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

export interface ColorInfo {
  hex: string;
  name: string;
  usage: string;
}

export interface BrandingAsset {
  id: string;
  userId: string;
  type: 'banner' | 'profile-pic' | 'social-post' | 'video' | 'palette';
  url?: string;
  prompt: string;
  caption?: string;
  colors?: ColorInfo[];
  tips?: string[];
  projectName?: string;
  tags?: string[];
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

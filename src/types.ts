export type Section = 'dashboard' | 'portfolio' | 'profile' | 'branding' | 'opportunities';

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string;
  tags: string[];
}

export interface ProfileData {
  platform: string;
  headline: string;
  bio: string;
  skills: string[];
  pricing: string;
}

export interface BrandingAsset {
  id: string;
  type: 'banner' | 'profile-pic' | 'social-post';
  url: string;
  prompt: string;
}

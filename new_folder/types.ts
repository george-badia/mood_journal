export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  interests?: string[];
}

export interface User {
  email: string;
  subscriptionStatus: 'free' | 'premium';
  profile?: UserProfile;
  profileCompleted: boolean;
}

export enum Mood {
  Awesome = 'Awesome',
  Good = 'Good',
  Okay = 'Okay',
  Bad = 'Bad',
  Terrible = 'Terrible',
}

export interface Emotion {
  emotion: string;
  score: number;
}

export interface AnalysisResult {
  overallSentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  emotions: Emotion[];
  summary: string;
  keywords: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: Mood;
  text: string;
  analysis?: AnalysisResult;
}
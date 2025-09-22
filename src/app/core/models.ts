export type DiaryPeriod = 'daily' | 'weekly' | 'monthly';

export interface FoodEntry {
  id: string;
  createdAt: string; // ISO timestamp
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodDrinkType: 'food' | 'drink';
  name: string;
  quantity?: string;
  notes?: string;
  photoUrl?: string; // data URL for local MVP
  temperature?: 'hot' | 'iced';
}

export interface UserProfile {
  id: string;
  displayName?: string;
  slug: string;
  isPublic: boolean;
}



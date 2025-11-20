export interface SportsField {
  id: string;
  name: string;
  type: 'tenis' | 'fotbal' | 'baschet' | 'volei' | 'handbal' | 'alte';
  location: string;
  city: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  amenities: string[];
  pricePerHour?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coach {
  id: string;
  name: string;
  sport: 'tenis' | 'fotbal' | 'baschet' | 'volei' | 'handbal' | 'alte';
  city: string;
  location?: string;
  description: string;
  experience: string;
  qualifications: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  pricePerHour?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}


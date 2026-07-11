export interface Destination {
  id: string;
  name: string;
  rating: number;
  location: string;
  description: string;
  detailedDescription: string;
  image: string;
  price: number;
  category: "Adventure & Outdoor" | "Nature & Sightseeing" | "Cultural & Heritage";
  subcategory: string;
  bestSeason: string;
  altitude: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Hard";
  reviewsCount: number;
  features: string[];
  isInsideValley: boolean;
}

export interface Booking {
  id: string;
  destinationId: string;
  destinationName: string;
  destinationImage: string;
  bookingDate: string;
  travelDate: string;
  travelersCount: number;
  totalPrice: number;
  status: "Confirmed" | "Pending" | "Cancelled";
}

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface UserPreferences {
  darkMode: boolean;
  favorites: string[]; // Destination IDs
}

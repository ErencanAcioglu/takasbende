export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  location: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Offer {
  id: string;
  listingId: string;
  offeredListingId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  listing?: Listing;
  offeredListing?: Listing;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: User;
}

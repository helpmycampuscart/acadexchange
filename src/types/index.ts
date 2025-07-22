export interface Product {
  id: string;
  uniqueId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  location: string;
  whatsappNumber: string;
  imageUrl?: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
  isSold: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export type Category = 'Books' | 'Electronics' | 'Furniture' | 'Accessories' | 'Miscellaneous';

export const CATEGORIES: Category[] = ['Books', 'Electronics', 'Furniture', 'Accessories', 'Miscellaneous'];

export const LOCATIONS = [
  // Hyderabad
  'Alwal', 'Amberpet', 'Ameerpet', 'Attapur', 'Bacharam', 'Bachupally', 'Barkatpura', 'Boduppal',
  'Chanda Nagar', 'Chikkadpally', 'Dilsukhnagar', 'ECIL', 'Gachibowli', 'Ghatkesar', 'Habsiguda',
  'Hasthinapuram', 'Hayath Nagar', 'Himayathnagar', 'Ibrahimpatnam', 'Jeedimetla', 'Kompally',
  'Kondapur', 'Koti', 'Kukatpally', 'Lingampally', 'Madhapur', 'Malakpet', 'Manikonda',
  'Maradpally', 'Medchal', 'Mehdipatnam', 'Miyapur', 'Musheerabad', 'Nallakunta', 'Nampally',
  'Narayanguda', 'Narsingi', 'Nizampet', 'Padmarao Nagar', 'Pochampally', 'Rajendra Nagar',
  'Ramachandra Puram', 'SR Nagar', 'Saroornagar', 'Secunderabad', 'Shankarpally', 'Tarnaka',
  'Turkayamzal', 'Uppal', 'Vidya Nagar',
  
  // Pune
  'Aundh', 'Balewadi', 'Baner', 'Bund Garden', 'Dhankawadi', 'Dhankawadi-Bibewadi', 'Hadapsar',
  'Hinjewadi', 'Karve Nagar', 'Koregaon Park', 'Kothrud', 'Magarpatta City', 'Pimple Saudagar',
  'Pune', 'Shivajinagar', 'Viman Nagar', 'Wakad',
  
  // Bangalore
  'BTM Layout', 'Banashankari', 'Bannerghatta Road', 'Basavanagudi', 'Bellandur', 'Electronic City',
  'HSR Layout', 'Hebbal', 'Indiranagar', 'J P Nagar', 'Jayanagar', 'K R Puram', 'Koramangala',
  'Mahalakshmi Layout', 'Malleshwaram', 'Marathahalli', 'Nagarbhavi', 'Rajaji Nagar', 'Sadashivanagar',
  'Sarjapur Road', 'Ulsoor', 'Vijayanagar', 'Whitefield', 'Yelahanka'
];
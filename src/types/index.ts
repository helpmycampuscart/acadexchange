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
  // Uttar Pradesh
  'Varanasi', 'Kanpur', 'Lucknow', 'Allahabad (Prayagraj)', 'Greater Noida', 'Agra', 'Bareilly', 'Meerut', 'Ghaziabad', 'Aligarh',
  
  // Maharashtra
  'Mumbai', 'Pune', 'Nagpur', 'Aurangabad', 'Nashik', 'Kolhapur', 'Ahmednagar', 'Thane', 'Jalgaon', 'Solapur',
  
  // Tamil Nadu
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem', 'Vellore', 'Erode', 'Thanjavur', 'Tirunelveli', 'Kancheepuram',
  
  // Madhya Pradesh
  'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Dewas', 'Ratlam',
  
  // West Bengal
  'Kolkata', 'Rajarhat / Newtown', 'Durgapur', 'Kharagpur', 'Siliguri', 'Bardhaman', 'Hooghly', 'Haldia', 'Midnapore', 'Kalyani',
  
  // Rajasthan
  'Jaipur', 'Kota', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner', 'Bharatpur', 'Alwar', 'Sikar', 'Pali',
  
  // Bihar
  'Patna', 'Gaya', 'Bhagalpur', 'Darbhanga', 'Muzaffarpur', 'Hajipur', 'Chapra', 'Arrah', 'Purnea', 'Saharsa',
  
  // Karnataka
  'Bangalore', 'Bengaluru', 'Mysore', 'Mangaluru (Mangalore)', 'Hubballi-Dharwad', 'Belagavi', 'Davangere', 'Kalaburagi (Gulbarga)', 'Shivamogga (Shimoga)', 'Tumakuru (Tumkur)', 'Manipal',
  
  // Andhra Pradesh
  'Visakhapatnam (Vizag)', 'Tirupati', 'Vijayawada', 'Guntur', 'Kakinada', 'Nellore', 'Anantapur', 'Kurnool', 'Rajahmundry', 'Ongole',
  
  // Gujarat
  'Ahmedabad', 'Gandhinagar', 'Vadodara (Baroda)', 'Surat', 'Rajkot', 'Anand', 'Bhavnagar', 'Jamnagar', 'Bhuj', 'Mehsana',
  
  // Delhi (Union Territory)
  'GTB Nagar', 'Mukherjee Nagar', 'Kamla Nagar', 'Laxmi Nagar', 'Malviya Nagar', 'South Extension & Amar Colony', 'Karol Bagh & Rajendra Place', 'Saket', 'Noida Sector 15, 25 & 62', 'Gurgaon Sector 44 & 45',
  
  // Existing Telangana (Hyderabad areas)
  'Alwal', 'Amberpet', 'Ameerpet', 'Attapur', 'Bacharam', 'Bachupally', 'Barkatpura', 'Boduppal',
  'Chanda Nagar', 'Chikkadpally', 'Dilsukhnagar', 'ECIL', 'Gachibowli', 'Ghatkesar', 'Habsiguda',
  'Hasthinapuram', 'Hayath Nagar', 'Himayathnagar', 'Ibrahimpatnam', 'Jeedimetla', 'Kompally',
  'Kondapur', 'Koti', 'Kukatpally', 'Lingampally', 'Madhapur', 'Malakpet', 'Manikonda',
  'Maradpally', 'Medchal', 'Mehdipatnam', 'Miyapur', 'Musheerabad', 'Nallakunta', 'Nampally',
  'Narayanguda', 'Narsingi', 'Nizampet', 'Padmarao Nagar', 'Pochampally', 'Rajendra Nagar',
  'Ramachandra Puram', 'SR Nagar', 'Saroornagar', 'Secunderabad', 'Shankarpally', 'Tarnaka',
  'Turkayamzal', 'Uppal', 'Vidya Nagar',
  
  // Existing Pune areas
  'Aundh', 'Balewadi', 'Baner', 'Bund Garden', 'Dhankawadi', 'Dhankawadi-Bibewadi', 'Hadapsar',
  'Hinjewadi', 'Karve Nagar', 'Koregaon Park', 'Kothrud', 'Magarpatta City', 'Pimple Saudagar',
  'Shivajinagar', 'Viman Nagar', 'Wakad',
  
  // Existing Bangalore areas
  'BTM Layout', 'Banashankari', 'Bannerghatta Road', 'Basavanagudi', 'Bellandur', 'Electronic City',
  'HSR Layout', 'Hebbal', 'Indiranagar', 'J P Nagar', 'Jayanagar', 'K R Puram', 'Koramangala',
  'Mahalakshmi Layout', 'Malleshwaram', 'Marathahalli', 'Nagarbhavi', 'Rajaji Nagar', 'Sadashivanagar',
  'Sarjapur Road', 'Ulsoor', 'Vijayanagar', 'Whitefield', 'Yelahanka'
];

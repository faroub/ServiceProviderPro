export interface Wilaya {
  code: string;
  en: string;
  fr: string;
  ar: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  icon: string;
}

export interface Review {
  id: string;
  bookingId?: string;
  providerId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Provider {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  category: string;
  hourlyRate: number;
  taskRate: number;
  city: string;
  wilayaCode: string;
  baladiya: string;
  crossWilaya: boolean;
  bio: string;
  avatarUrl: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  idDocumentUrl?: string;
  trialDaysLeft: number;
  active: boolean;
  portfolio: string[];
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerCategory: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  bookingType: 'hourly' | 'quote';
  date: string;
  timeSlot: string;
  address: string;
  wilayaCode: string;
  baladiya: string;
  description: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  priceEstimate: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ReportItem {
  id: string;
  providerId: string;
  providerName: string;
  reportedBy: string;
  reason: string;
  details: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export const CATEGORIES: Category[] = [
  { id: "plumbing", nameEn: "Plumbing", nameFr: "Plomberie", nameAr: "سباكة", icon: "Wrench" },
  { id: "electrical", nameEn: "Electrical", nameFr: "Électricité", nameAr: "كهرباء", icon: "Zap" },
  { id: "cleaning", nameEn: "Cleaning", nameFr: "Nettoyage", nameAr: "تنظيف", icon: "Sparkles" },
  { id: "carpentry", nameEn: "Carpentry", nameFr: "Menuiserie", nameAr: "نجارة", icon: "Hammer" },
  { id: "painting", nameEn: "Painting", nameFr: "Peinture", nameAr: "دهان", icon: "Paintbrush" },
  { id: "landscaping", nameEn: "Landscaping", nameFr: "Jardinage", nameAr: "بستنة وتنسيق", icon: "Trees" },
  { id: "it_support", nameEn: "IT Support", nameFr: "Support Informatique", nameAr: "صيانة أجهزة وشبكات", icon: "Laptop" },
  { id: "admin_consulting", nameEn: "Consulting", nameFr: "Conseil Administratif", nameAr: "استشارات إدارية", icon: "Briefcase" },
  { id: "education", nameEn: "Tutoring", nameFr: "Soutien Scolaire", nameAr: "دروس خصوصية", icon: "GraduationCap" },
  { id: "photography", nameEn: "Photography", nameFr: "Photographie", nameAr: "تصوير فوتوغرافي", icon: "Camera" },
  { id: "moving", nameEn: "Moving", nameFr: "Déménagement", nameAr: "نقل أثاث", icon: "Truck" },
];

export const WILAYAS: Wilaya[] = [
  { code: "01", en: "Adrar", fr: "Adrar", ar: "أدرار" },
  { code: "02", en: "Chlef", fr: "Chlef", ar: "الشلف" },
  { code: "03", en: "Laghouat", fr: "Laghouat", ar: "الأغواط" },
  { code: "04", en: "Oum El Bouaghi", fr: "Oum El Bouaghi", ar: "أم البواقي" },
  { code: "05", en: "Batna", fr: "Batna", ar: "باتنة" },
  { code: "06", en: "Béjaïa", fr: "Béjaïa", ar: "بجاية" },
  { code: "07", en: "Biskra", fr: "Biskra", ar: "بسكرة" },
  { code: "08", en: "Béchar", fr: "Béchar", ar: "بشار" },
  { code: "09", en: "Blida", fr: "Blida", ar: "البليدة" },
  { code: "10", en: "Bouira", fr: "Bouira", ar: "البويرة" },
  { code: "11", en: "Tamanrasset", fr: "Tamanrasset", ar: "تمنراست" },
  { code: "12", en: "Tébessa", fr: "Tébessa", ar: "تبسة" },
  { code: "13", en: "Tlemcen", fr: "Tlemcen", ar: "تلمسان" },
  { code: "14", en: "Tiaret", fr: "Tiaret", ar: "تيارت" },
  { code: "15", en: "Tizi Ouzou", fr: "Tizi Ouzou", ar: "تيزي وزو" },
  { code: "16", en: "Algiers", fr: "Alger", ar: "الجزائر" },
  { code: "17", en: "Djelfa", fr: "Djelfa", ar: "الجلفة" },
  { code: "18", en: "Jijel", fr: "Jijel", ar: "جيجل" },
  { code: "19", en: "Sétif", fr: "Sétif", ar: "سطيف" },
  { code: "20", en: "Saïda", fr: "Saïda", ar: "سعيدة" },
  { code: "21", en: "Skikda", fr: "Skikda", ar: "سكيكدة" },
  { code: "22", en: "Sidi Bel Abbès", fr: "Sidi Bel Abbès", ar: "سيدي بلعباس" },
  { code: "23", en: "Annaba", fr: "Annaba", ar: "عنابة" },
  { code: "24", en: "Guelma", fr: "Guelma", ar: "قالمة" },
  { code: "25", en: "Constantine", fr: "Constantine", ar: "قسنطينة" },
  { code: "26", en: "Médéa", fr: "Médéa", ar: "المدية" },
  { code: "27", en: "Mostaganem", fr: "Mostaganem", ar: "مستغانم" },
  { code: "28", en: "M'Sila", fr: "M'Sila", ar: "المسيلة" },
  { code: "29", en: "Mascara", fr: "Mascara", ar: "معسكر" },
  { code: "30", en: "Ouargla", fr: "Ouargla", ar: "ورقلة" },
  { code: "31", en: "Oran", fr: "Oran", ar: "وهران" },
  { code: "32", en: "El Bayadh", fr: "El Bayadh", ar: "البيض" },
  { code: "33", en: "Illizi", fr: "Illizi", ar: "إليزي" },
  { code: "34", en: "Bordj Bou Arréridj", fr: "Bordj Bou Arréridj", ar: "برج بوعريريج" },
  { code: "35", en: "Boumerdès", fr: "Boumerdès", ar: "بومرداس" },
  { code: "36", en: "El Tarf", fr: "El Tarf", ar: "الطارف" },
  { code: "37", en: "Tindouf", fr: "Tindouf", ar: "تندوف" },
  { code: "38", en: "Tissemsilt", fr: "Tissemsilt", ar: "تيسمسيلت" },
  { code: "39", en: "El Oued", fr: "El Oued", ar: "الوادي" },
  { code: "40", en: "Khenchela", fr: "Khenchela", ar: "خنشلة" },
  { code: "41", en: "Souk Ahras", fr: "Souk Ahras", ar: "سوق أهراس" },
  { code: "42", en: "Tipaza", fr: "Tipaza", ar: "تيبازة" },
  { code: "43", en: "Mila", fr: "Mila", ar: "ميلة" },
  { code: "44", en: "Aïn Defla", fr: "Aïn Defla", ar: "عين الدفلى" },
  { code: "45", en: "Naâma", fr: "Naâma", ar: "النعامة" },
  { code: "46", en: "Aïn Témouchent", fr: "Aïn Témouchent", ar: "عين تموشنت" },
  { code: "47", en: "Ghardaïa", fr: "Ghardaïa", ar: "غرداية" },
  { code: "48", en: "Relizane", fr: "Relizane", ar: "غليزان" },
  { code: "49", en: "Timimoun", fr: "Timimoun", ar: "تيميمون" },
  { code: "50", en: "Bordj Badji Mokhtar", fr: "Bordj Badji Mokhtar", ar: "برج باجي مختار" },
  { code: "51", en: "Ouled Djellal", fr: "Ouled Djellal", ar: "أولاد جلال" },
  { code: "52", en: "Béni Abbès", fr: "Béni Abbès", ar: "بني عباس" },
  { code: "53", en: "In Salah", fr: "In Salah", ar: "عين صالح" },
  { code: "54", en: "In Guezzam", fr: "In Guezzam", ar: "عين قزام" },
  { code: "55", en: "Touggourt", fr: "Touggourt", ar: "تقرت" },
  { code: "56", en: "Djanet", fr: "Djanet", ar: "جانت" },
  { code: "57", en: "El M'Ghair", fr: "El M'Ghair", ar: "المغير" },
  { code: "58", en: "El Meniaa", fr: "El Meniaa", ar: "المنيعة" },
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: "p1",
    fullName: "Ahmed Boumediene",
    email: "ahmed.boumediene@khedmapro.dz",
    phone: "+213550123456",
    category: "plumbing",
    hourlyRate: 800,
    taskRate: 2500,
    city: "Algiers",
    wilayaCode: "16",
    baladiya: "Bab Ezzouar",
    crossWilaya: false,
    bio: "10+ years experience in residential and commercial plumbing. Leak detection, water heaters, and pipe replacements. Fast, clean, and reliable.",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 38,
    verified: true,
    verificationStatus: 'verified',
    trialDaysLeft: 74,
    active: true,
    portfolio: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&fit=crop&q=80"
    ]
  },
  {
    id: "p2",
    fullName: "Karim Belkacem",
    email: "karim.belkacem@khedmapro.dz",
    phone: "+213551987654",
    category: "electrical",
    hourlyRate: 1000,
    taskRate: 3000,
    city: "Oran",
    wilayaCode: "31",
    baladiya: "Bir El Djir",
    crossWilaya: true,
    bio: "Certified master electrician for homes and commercial shops. Electrical diagnostics, rewiring, smart lighting, and 24/7 breaker emergency fixes.",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 42,
    verified: true,
    verificationStatus: 'verified',
    trialDaysLeft: 60,
    active: true,
    portfolio: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&fit=crop&q=80"
    ]
  },
  {
    id: "p3",
    fullName: "Amina Cherif",
    email: "amina.cherif@khedmapro.dz",
    phone: "+213552345678",
    category: "cleaning",
    hourlyRate: 600,
    taskRate: 2200,
    city: "Algiers",
    wilayaCode: "16",
    baladiya: "Hydra",
    crossWilaya: false,
    bio: "Professional deep cleaning service for villas, apartments, and corporate offices. Safe eco-friendly disinfectants and modern equipment.",
    avatarUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 56,
    verified: true,
    verificationStatus: 'verified',
    trialDaysLeft: 82,
    active: true,
    portfolio: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&fit=crop&q=80"
    ]
  },
  {
    id: "p4",
    fullName: "Youcef Mansouri",
    email: "youcef.mansouri@khedmapro.dz",
    phone: "+213553456789",
    category: "carpentry",
    hourlyRate: 900,
    taskRate: 3500,
    city: "Constantine",
    wilayaCode: "25",
    baladiya: "Constantine Centre",
    crossWilaya: true,
    bio: "Artisan carpenter creating custom wood kitchens, closets, doors, and antique furniture restoration. Precision craftsmanship.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80",
    rating: 4.7,
    reviewsCount: 29,
    verified: true,
    verificationStatus: 'verified',
    trialDaysLeft: 45,
    active: true,
    portfolio: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&fit=crop&q=80"
    ]
  },
  {
    id: "p5",
    fullName: "Sofiane Kaci",
    email: "sofiane.kaci@khedmapro.dz",
    phone: "+213554567890",
    category: "painting",
    hourlyRate: 700,
    taskRate: 2800,
    city: "Algiers",
    wilayaCode: "16",
    baladiya: "Kouba",
    crossWilaya: true,
    bio: "Interior & exterior decorative painting. Stucco, Venetian plaster, waterproof facade finishes, and meticulous clean-up afterwards.",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80",
    rating: 4.85,
    reviewsCount: 31,
    verified: true,
    verificationStatus: 'verified',
    trialDaysLeft: 55,
    active: true,
    portfolio: [
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&fit=crop&q=80"
    ]
  },
  {
    id: "p6",
    fullName: "Nadia Haddad",
    email: "nadia.haddad@khedmapro.dz",
    phone: "+213555678901",
    category: "landscaping",
    hourlyRate: 650,
    taskRate: 2400,
    city: "Blida",
    wilayaCode: "09",
    baladiya: "Blida Centre",
    crossWilaya: true,
    bio: "Landscape architect and gardener. Lawn care, automatic drip irrigation installation, citrus tree trimming, and floral landscaping.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 22,
    verified: true,
    verificationStatus: 'verified',
    trialDaysLeft: 68,
    active: true,
    portfolio: [
      "https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=600&fit=crop&q=80"
    ]
  },
  {
    id: "p7",
    fullName: "Riad Zerouki",
    email: "riad.zerouki@khedmapro.dz",
    phone: "+213556789012",
    category: "it_support",
    hourlyRate: 1500,
    taskRate: 4000,
    city: "Algiers",
    wilayaCode: "16",
    baladiya: "Cheraga",
    crossWilaya: false,
    bio: "Hardware diagnostics, custom PC build, Wi-Fi mesh optimization, NAS backup solutions, and CCTV camera installation for homes.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80",
    rating: 4.95,
    reviewsCount: 47,
    verified: true,
    verificationStatus: 'verified',
    trialDaysLeft: 90,
    active: true,
    portfolio: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&fit=crop&q=80"
    ]
  },
  {
    id: "p8",
    fullName: "Nassim Bouzid",
    email: "nassim.bouzid@khedmapro.dz",
    phone: "+213557890123",
    category: "education",
    hourlyRate: 1000,
    taskRate: 3000,
    city: "Oran",
    wilayaCode: "31",
    baladiya: "Oran Centre",
    crossWilaya: true,
    bio: "Experienced Math & Physics tutor for BEM and BAC students. Personalized worksheets, intensive exam revision, and guaranteed improvement.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80",
    rating: 4.88,
    reviewsCount: 39,
    verified: false,
    verificationStatus: 'pending',
    trialDaysLeft: 85,
    active: true,
    portfolio: []
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    providerId: "p1",
    clientName: "Yasmine Amarouche",
    rating: 5,
    comment: "Ahmed arrived in 30 minutes in Bab Ezzouar, quickly spotted the wall leak and fixed the pipe without damaging our tile. Very polite and honest pricing!",
    createdAt: "2026-03-02T14:30:00Z"
  },
  {
    id: "r2",
    providerId: "p1",
    clientName: "Karim Meziane",
    rating: 5,
    comment: "Installed our brand new water heater cleanly with safe gas fittings. Highly recommended across Algiers.",
    createdAt: "2026-02-28T11:15:00Z"
  },
  {
    id: "r3",
    providerId: "p2",
    clientName: "Fatima Benali",
    rating: 5,
    comment: "Replaced an old circuit breaker in Bir El Djir. Very knowledgeable about Algerian safety codes. Cleaned up every wire snippet.",
    createdAt: "2026-03-05T09:40:00Z"
  },
  {
    id: "r4",
    providerId: "p3",
    clientName: "Sofiane Djedid",
    rating: 5,
    comment: "Amina and her team made our apartment look brand new after a renovation. Incredible attention to windows and kitchen tiles.",
    createdAt: "2026-03-06T16:00:00Z"
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    providerId: "p1",
    providerName: "Ahmed Boumediene",
    providerCategory: "Plumbing",
    clientId: "c_guest",
    clientName: "Youcef Taleb",
    clientPhone: "+213559112233",
    bookingType: "hourly",
    date: "2026-03-14",
    timeSlot: "09:00 - 11:00",
    address: "Cité 1200 Logements, Bâtiment 4",
    wilayaCode: "16",
    baladiya: "Bab Ezzouar",
    description: "Bathroom sink faucet is leaking and water pressure has dropped.",
    status: "confirmed",
    priceEstimate: 1600,
    createdAt: "2026-03-10T10:00:00Z"
  },
  {
    id: "b2",
    providerId: "p2",
    providerName: "Karim Belkacem",
    providerCategory: "Electrical",
    clientId: "c_guest",
    clientName: "Youcef Taleb",
    clientPhone: "+213559112233",
    bookingType: "quote",
    date: "2026-03-18",
    timeSlot: "14:00 - 17:00",
    address: "Boulevard Millenium",
    wilayaCode: "31",
    baladiya: "Bir El Djir",
    description: "Installing 6 LED recessed spotlights in living room ceiling with dimmer switch.",
    status: "pending",
    priceEstimate: 3500,
    createdAt: "2026-03-11T08:30:00Z"
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    threadId: "p1",
    senderId: "p1",
    senderName: "Ahmed Boumediene",
    text: "Salam Youcef! I saw your plumbing request for Saturday. Could you send a quick picture of the faucet so I bring the right copper joints?",
    timestamp: "10:15 AM",
    isRead: true
  },
  {
    id: "m2",
    threadId: "p1",
    senderId: "c_guest",
    senderName: "Youcef Taleb",
    text: "Wa alaykom salam Ahmed! Sure thing, it is an Italian Hansgrohe mixer, the seal underneath seems degraded.",
    timestamp: "10:18 AM",
    isRead: true
  },
  {
    id: "m3",
    threadId: "p1",
    senderId: "p1",
    senderName: "Ahmed Boumediene",
    text: "Perfect, I have the exact ceramic cartridge in my kit. See you Saturday at 9:00 AM in Bab Ezzouar inshallah!",
    timestamp: "10:20 AM",
    isRead: false
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "rep1",
    providerId: "p8",
    providerName: "Nassim Bouzid",
    reportedBy: "Parent of student",
    reason: "Late arrival without prior notice",
    details: "Tutor was 45 minutes late for the introductory physics session.",
    status: "open",
    createdAt: "2026-03-09T18:20:00Z"
  }
];

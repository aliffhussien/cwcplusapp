export interface UserProfile {
    id: string | null;
    email: string | null;
    name: string;
    subscriptionTier: 'Free' | 'Basic Premium' | 'Plus Member' | 'Gold Member' | string;
    role: 'user' | 'admin' | 'management' | 'employee' | string;
    isGod: boolean;
    unlockedVolumes: string[];
    unlockedClasses: number[];
    avatarUrl: string | null;
    coverUrl: string | null;
    dietaryPreferences: string[];
    favoriteFood: string | null;
    pushSubscription?: any;
}

export interface Recipe {
    id: number;
    title: string;
    author: string | null;
    time: string | null;
    image: string | null;
    category: string | null;
    difficulty: string | null;
    rating: number;
    status: 'published' | 'draft';
    isFeatured: boolean;
    tierRequired: 'Free' | 'Basic' | 'Plus' | 'Premium' | string;
    volume: string;
    scheduled_post_date?: string;
    created_at?: string;
    cover_image_id?: number;
    hero_image?: string;
    hero_image_id?: number;
}

export interface CookingClass {
    id: number;
    title: string;
    instructor: string;
    duration: string;
    price: string;
    image: string;
    video?: string;
    status: 'published' | 'draft';
    tierRequired: 'Free' | 'Basic' | 'Plus' | 'Premium' | string;
    isFeatured: boolean;
    ingredients?: any[];
    steps?: string[];
    notes?: string;
    attachments?: any[];
    live_link?: string;
    created_at?: string;
}

export interface PremiumTier {
    id: string;
    name: string;
    price: string;
    discount: number;
    benefits: string;
}

export interface Volume {
    id: string;
    name: string;
    price: string;
    discount: number;
}

export interface PlatformSettings {
    heroTitle: string;
    siteName: string;
    maintenanceMode: boolean;
    bannerEnabled: boolean;
    bannerText: string;
    youtubeLiveUrl?: string;
    tiktokLiveUrl?: string;
    classesHeroTitle?: string;
    classesHeroDesc?: string;
    classesHeroClassId?: string;
    classesHeroImageUrl?: string;
    currency: string;
    premiumTiers: PremiumTier[];
    accentColor: string;
    secondaryAccentColor: string;
    plugins: { stripe: boolean; mailchimp: boolean; zapier: boolean };
    apiKeys: any[];
    volumes: Volume[];
}

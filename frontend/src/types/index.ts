export interface User {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
    subscription?: Subscription;
    credits?: Credits;
}

export interface Plan {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    monthlyPricePKR: number;
    yearlyPricePKR: number;
    creditsPerMonth: number;
    maxVoiceClones: number;
    features: string[];
    isFree: boolean;
}

export interface Subscription {
    id: string;
    planId: string;
    plan: Plan;
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'TRIAL';
    billingCycle: 'MONTHLY' | 'YEARLY';
    currentPeriodStart: string;
    currentPeriodEnd: string;
}

export interface Credits {
    id: string;
    totalCredits: number;
    usedCredits: number;
    bonusCredits: number;
    nextResetAt: string;
}

export interface Voice {
    id: string;
    name: string;
    description?: string;
    status: 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED';
    sampleUrls: string[];
    createdAt: string;
}

export interface Generation {
    id: string;
    voiceId: string;
    voice?: { id: string; name: string };
    text: string;
    characterCount: number;
    language: string;
    audioUrl?: string;
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    duration?: number;
    creditsCost: number;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UsageStats {
    credits: {
        total: number;
        used: number;
        bonus: number;
        available: number;
        nextResetAt?: string;
    };
    thisMonth: {
        charactersGenerated: number;
        generationCount: number;
    };
    voiceCount: number;
}

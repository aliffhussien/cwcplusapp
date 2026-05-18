import React from 'react';

declare module '../context/AppDataProvider' {
    export const RecipesContext: React.Context<any>;
    export const ClassesContext: React.Context<any>;
    export const SettingsContext: React.Context<any>;
    export const MediaContext: React.Context<any>;
    export const MerchContext: React.Context<any>;
    export const NotificationsContext: React.Context<any>;
    export const AppDataContext: React.Context<any>;
    export const AppDataProvider: React.FC<any>;
}

declare module '../context/AppContexts' {
    export const RecipesContext: React.Context<any>;
    export const ClassesContext: React.Context<any>;
    export const SettingsContext: React.Context<any>;
    export const MediaContext: React.Context<any>;
    export const MerchContext: React.Context<any>;
    export const NotificationsContext: React.Context<any>;
    export const AppDataContext: React.Context<any>;
}

declare module '../lib/currency' {
    export const formatCurrency: (amount: number | string, currency?: string) => string;
}

declare module '../lib/mediaUtils' {
    export const getMediaUrl: (id: string, mediaArray: any[]) => string;
    export const getMediaAssetUrl: (id: string | null | undefined, mediaArray: any[], fallback?: string | null | undefined) => string;
}

declare module '../lib/dateUtils' {
    export const formatDate: (date: string | Date) => string;
    export const formatTime: (date: string | Date) => string;
}

declare module '../config/appCopy' {
    export const APP_COPY: any;
}

declare module '../components/admin/*' {
    const Component: any;
    export default Component;
}

declare module '../components/admin/tabs/*' {
    const Component: any;
    export default Component;
}

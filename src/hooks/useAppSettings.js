import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const defaultSettings = {
    heroTitle: "Ready to cook, Chef?",
    siteName: "CWC+ Smart Hub",
    maintenanceMode: false,
    bannerEnabled: false,
    bannerText: "New Masterclass dropping this Friday! 🚀",
    premiumTiers: [
        { id: 'tier1', name: 'Basic Premium', price: '5.99', discount: 0, benefits: 'Ad-free experience, 10 Recipes/mo' },
        { id: 'tier2', name: 'Pro Premium', price: '12.99', discount: 0, benefits: 'All Recipes, 1 Masterclass/mo, Priority Support' },
        { id: 'tier3', name: 'Elite Premium', price: '29.99', discount: 0, benefits: 'All Access, Live Q&A, VIP Community' }
    ],
    plugins: { stripe: false, mailchimp: false, zapier: false },
    apiKeys: [],
    volumes: [
        { id: 'v1', name: 'Volume 1', price: '9.99', discount: 0 },
        { id: 'v2', name: 'Volume 2', price: '14.99', discount: 10 },
        { id: 'cwc', name: 'CWC Original', price: '4.99', discount: 0 }
    ]
};

export function useAppSettings() {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase.from('settings').select('config').eq('id', 'platform').single();
            
            if (error) {
                console.error("Error fetching settings:", error);
                const stored = localStorage.getItem('cwc_settings');
                if (stored) setSettings(JSON.parse(stored));
                else setSettings(defaultSettings);
                return;
            }

            if (data && data.config) {
                setSettings({ ...defaultSettings, ...data.config });
            }
        };

        fetchSettings();

        const channel = supabase.channel('settings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.platform' }, () => {
                fetchSettings();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('cwc_settings', JSON.stringify(updated));
        
        const { error } = await supabase.from('settings').upsert({ id: 'platform', config: updated, updated_at: new Date() });
        if (error) {
            console.error("Error updating settings:", error);
        }
    };

    return { settings, updateSettings };
}

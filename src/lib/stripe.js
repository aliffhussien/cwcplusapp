import { supabase } from './supabase';

export const createStripeCheckout = async (amount, currency, reference, redirectUrl, productName = 'CWC+ Purchase') => {
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { amount, currency, reference, redirectUrl, productName }
        });

        if (error) {
            console.error("Stripe Edge Function Error:", error);
            throw error;
        }

        if (data && data.url) {
            return data.url;
        } else {
            throw new Error("No checkout URL returned from Stripe.");
        }
    } catch (err) {
        console.error("Failed to create Stripe checkout:", err);
        throw err;
    }
};

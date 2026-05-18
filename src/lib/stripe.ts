import { supabase } from './supabase';

export const createStripeCheckout = async (
    amount: number,
    currency: string,
    reference: string,
    redirectUrl: string,
    productName: string = 'CWC+ Purchase'
): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { amount, currency, reference, redirectUrl, productName }
        });

        if (error) {
            throw error;
        }

        if (data && data.url) {
            return data.url as string;
        } else {
            throw new Error("No checkout URL returned from Stripe.");
        }
    } catch (err) {
        throw err;
    }
};

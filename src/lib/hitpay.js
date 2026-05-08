// HitPay Payment Gateway Integration
// IMPORTANT: In a production app, this logic MUST be moved to a backend server
// or Supabase Edge Function to prevent exposing your HitPay API Key to the public!

const HITPAY_API_URL = import.meta.env.VITE_HITPAY_ENV === 'production' 
    ? 'https://api.hit-pay.com/v1' 
    : 'https://api.sandbox.hit-pay.com/v1';

export const createHitPayCheckout = async (amount, currency = 'SGD', reference_number, redirect_url) => {
    try {
        const apiKey = import.meta.env.VITE_HITPAY_API_KEY;
        
        if (!apiKey) {
            console.warn("⚠️ No HitPay API Key found in .env.local. Simulating checkout for demo purposes.");
            return {
                id: "mock_checkout_id",
                url: `${redirect_url}${redirect_url.includes('?') ? '&' : '?'}status=success&reference=${reference_number}&mock=true`,
                status: "pending"
            };
        }

        const response = await fetch(`${HITPAY_API_URL}/payment-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-BUSINESS-API-KEY': apiKey
            },
            body: new URLSearchParams({
                amount: amount.toString(),
                currency: currency,
                reference_number: reference_number,
                redirect_url: redirect_url
            })
        });

        if (!response.ok) {
            throw new Error(`HitPay API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data; // Returns { id, url, status, etc. }

    } catch (error) {
        console.error("HitPay Payment Error:", error);
        throw error;
    }
};

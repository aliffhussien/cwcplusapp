// HitPay Payment Gateway Integration
// TODO: Move this to a Supabase Edge Function before going live —
// calling HitPay directly from the browser exposes your API key to users.

const HITPAY_API_URL = import.meta.env.VITE_HITPAY_ENV === 'production'
    ? 'https://api.hit-pay.com/v1'
    : 'https://api.sandbox.hit-pay.com/v1';

export const createHitPayCheckout = async (amount, currency = 'SGD', reference_number, redirect_url) => {
    const apiKey = import.meta.env.VITE_HITPAY_API_KEY;

    if (!apiKey) {
        console.warn('No HitPay API Key in .env — simulating checkout.');
        return {
            id: 'mock_checkout_id',
            url: `${redirect_url}${redirect_url.includes('?') ? '&' : '?'}status=success&reference=${reference_number}&mock=true`,
            status: 'pending'
        };
    }

    const response = await fetch(`${HITPAY_API_URL}/payment-requests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-BUSINESS-API-KEY': apiKey
        },
        body: new URLSearchParams({ amount: amount.toString(), currency, reference_number, redirect_url })
    });

    if (!response.ok) throw new Error(`HitPay API Error: ${response.statusText}`);
    return response.json();
};

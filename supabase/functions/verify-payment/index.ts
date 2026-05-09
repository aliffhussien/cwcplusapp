// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import Stripe from "https://esm.sh/stripe@12.1.1?target=deno"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { session_id, type, item_id, user_id } = await req.json()

        if (!session_id || !type || !item_id || !user_id) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Verify with Stripe — this is the server-side truth
        const session = await stripe.checkout.sessions.retrieve(session_id)
        if (session.payment_status !== 'paid') {
            return new Response(JSON.stringify({ error: 'Payment not completed' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 402,
            })
        }

        // Use service role to bypass RLS and write the unlock directly
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        )

        // Fetch current user row
        const { data: person, error: personError } = await supabase
            .from('people')
            .select('unlocked_volumes, unlocked_classes')
            .eq('id', user_id)
            .single()

        if (personError || !person) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            })
        }

        // Write unlock to DB
        if (type === 'volume') {
            const current: string[] = person.unlocked_volumes || []
            if (!current.includes(item_id)) {
                await supabase.from('people')
                    .update({ unlocked_volumes: [...current, item_id] })
                    .eq('id', user_id)
            }
        } else if (type === 'class') {
            const current: any[] = person.unlocked_classes || []
            const itemAsNumber = Number(item_id)
            if (!current.includes(item_id) && !current.includes(itemAsNumber)) {
                await supabase.from('people')
                    .update({ unlocked_classes: [...current, itemAsNumber || item_id] })
                    .eq('id', user_id)
            }
        }

        // Record the order
        await supabase.from('orders').insert([{
            user_id,
            stripe_session_id: session_id,
            amount: (session.amount_total ?? 0) / 100,
            currency: session.currency?.toUpperCase() ?? 'USD',
            item_type: type,
            item_id: String(item_id),
            status: 'paid',
            created_at: new Date().toISOString(),
        }]).select()  // ignore insert errors if orders table doesn't have these columns yet

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

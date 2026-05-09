// @ts-ignore
import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import webpush from 'https://esm.sh/web-push'

declare const Deno: any;

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

serve(async (req: Request) => {
  const { record } = await req.json()

  // 1. Initialize Supabase Admin
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 2. Fetch all users with push subscriptions
  const { data: users } = await supabase
    .from('people')
    .select('push_subscription')
    .not('push_subscription', 'is', null)

  if (!users || users.length === 0) return new Response('No subscribers')

  // 3. Send Push to each device
  const notifications = users.map((user: any) => {
    const payload = JSON.stringify({
      title: record.title,
      body: record.message,
      icon: '/icon.png',
      data: {
        url: record.attachment_type === 'recipe' ? `/recipe/${record.attachment_id}` : '/',
      }
    })

    return webpush.sendNotification(user.push_subscription, payload).catch((err: any) => {
      console.error('Failed to send to device:', err)
    })
  })

  await Promise.all(notifications)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

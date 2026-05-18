import { CreditCard, Smartphone, MessageCircle, Zap, BarChart, Mail } from 'lucide-react';

export const AVAILABLE_PLUGINS = [
  { id: 'stripe', name: 'Stripe Payments', icon: CreditCard, desc: 'Process credit cards globally.', color: 'text-accent-sec' },
  { id: 'hitpay', name: 'HitPay Gateway', icon: Smartphone, desc: 'Process payments via PayNow & FPX.', color: 'text-rose-400' },
  { id: 'whatsapp', name: 'WhatsApp Bot', icon: MessageCircle, desc: 'Send automated alerts to members.', color: 'text-accent-sec' },
  { id: 'discord', name: 'Discord Sync', icon: Zap, desc: 'Sync premium members to roles.', color: 'text-accent' },
  { id: 'google_analytics', name: 'Google Analytics', icon: BarChart, desc: 'Track visitor traffic & behavior.', color: 'text-amber-500' },
  { id: 'mailchimp', name: 'Mailchimp Sync', icon: Mail, desc: 'Auto-sync members to mailing lists.', color: 'text-yellow-400' },
  { id: 'zapier', name: 'Zapier Webhooks', icon: Zap, desc: 'Connect platform events to 5,000+ apps.', color: 'text-orange-500' }
];

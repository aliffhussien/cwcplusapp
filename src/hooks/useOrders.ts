import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ORDER_COLS = 'id, user_id, customer, email, phone, address, product, amount, status, fulfillment, stripe_session_id, item_type, item_id, created_at';

export interface Order {
  id: string;
  user_id?: string;
  customer: string;
  email: string;
  phone?: string;
  address?: string;
  product: string;
  amount: number;
  status: string;
  fulfillment: string;
  stripe_session_id?: string;
  item_type?: string;
  item_id?: string;
  created_at: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(ORDER_COLS)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (!error && data) {
        setOrders(data as Order[]);
      }
      setIsLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel('cwc_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (!cancelled) fetchOrders();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const { error } = await supabase.from('orders').update(updates).eq('id', id);
    if (error) {
      throw error;
    }
  };

  return { orders, isLoading, updateOrder };
}

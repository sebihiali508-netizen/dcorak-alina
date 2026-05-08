import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";

export const getPendingOrdersCount = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  return count ?? 0;
});

export const getOrders = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { orders, count: orders?.length ?? 0 };
});

export const getOrder = createServerFn({ method: "GET" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", data.id)
    .single();
  if (error) throw new Error(error.message);
  return order;
});

export const createOrder = createServerFn({ method: "POST" }).handler(async ({ data }: any) => {
  const supabase = createClient();
  const orderNumber = generateOrderNumber();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: data.customer_name,
      customer_email: data.customer_email || null,
      customer_phone: data.customer_phone || null,
      customer_address: data.customer_address,
      payment_method: data.payment_method || "cash",
      total_amount: data.total_amount,
      shipping_cost: data.shipping_cost || 0,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`Erreur création commande: ${error.message}`);

  if (data.items?.length) {
    const orderItems = data.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) throw new Error(`Erreur création articles: ${itemsError.message}`);
  }

  return order;
});

export const updateOrderStatus = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return order;
  },
);

export const updatePaymentStatus = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { data: order, error } = await supabase
      .from("orders")
      .update({ payment_status: data.payment_status, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return order;
  },
);

export const updateOrderNotes = createServerFn({ method: "POST" }).handler(
  async ({ data }: any) => {
    const supabase = createClient();
    const { data: order, error } = await supabase
      .from("orders")
      .update({ notes: data.notes, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return order;
  },
);

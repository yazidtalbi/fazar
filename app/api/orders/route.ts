import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils/order";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create buyer profile
  let { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!buyerProfile) {
    const { data: newProfile } = await supabase
      .from("buyer_profiles")
      .insert({ id: user.id })
      .select("id")
      .single();
    buyerProfile = newProfile;
  }

  const body = await request.json();
  const { shippingAddress, shippingMethod, phone } = body;

  // Get cart items
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select(`
      *,
      products!inner(id, price, stock_quantity, status)
    `)
    .eq("buyer_id", user.id);

  if (cartError || !cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Validate all products are active and in stock
  for (const cartItem of cartItems) {
    const product = cartItem.products as any;
    if (product.status !== "active") {
      return NextResponse.json({ error: `Product ${product.title} is no longer available` }, { status: 400 });
    }
    if (product.stock_quantity < cartItem.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.title}` }, { status: 400 });
    }
  }

  // Calculate totals
  let subtotal = 0;
  for (const cartItem of cartItems) {
    const product = cartItem.products as any;
    subtotal += Number(product.price) * cartItem.quantity;
  }

  const shippingCost = 0; // Can be calculated based on shipping method
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Create order using RPC function to avoid RLS recursion
  // The function bypasses RLS, preventing infinite recursion when user has both buyer/seller profiles
  let orderId: string | null = null;
  let orderError = null;
  let currentOrderNumber = orderNumber;
  let attempts = 0;
  const maxAttempts = 3;

  while (!orderId && attempts < maxAttempts) {
    const { data: orderIdData, error: rpcError } = await supabase.rpc("create_order_with_id", {
      p_buyer_id: user.id,
      p_order_number: currentOrderNumber,
      p_payment_method: "cod",
      p_shipping_method: shippingMethod || "Amana",
      p_shipping_address: shippingAddress,
      p_subtotal: subtotal,
      p_shipping_cost: shippingCost,
      p_tax: tax,
      p_total: total,
      p_status: "pending",
    });

    if (rpcError) {
      // If duplicate order number, generate a new one and retry
      if (rpcError.code === "23505" || rpcError.message?.includes("duplicate key") || rpcError.message?.includes("order_number")) {
        currentOrderNumber = generateOrderNumber();
        attempts++;
        continue;
      } else {
        orderError = rpcError;
        break;
      }
    }

    orderId = orderIdData;
    if (orderId) {
      break;
    }
  }

  if (orderError || !orderId) {
    return NextResponse.json({ error: orderError?.message || "Failed to create order" }, { status: 400 });
  }

  // Create order items using RPC function to avoid RLS recursion
  const orderItems = cartItems.map((cartItem) => {
    const product = cartItem.products as any;
    return {
      order_id: orderId,
      product_id: product.id,
      quantity: cartItem.quantity,
      price_at_purchase: product.price,
    };
  });

  // Log the order items being sent for debugging
  console.log("Creating order items:", JSON.stringify(orderItems, null, 2));
  
  const { data: insertResult, error: itemsError } = await supabase.rpc("insert_order_items", {
    p_order_items: orderItems as any, // Pass as JSONB - Supabase will handle the conversion
  });

  if (itemsError) {
    console.error("Failed to create order items:", {
      message: itemsError.message,
      details: itemsError.details,
      hint: itemsError.hint,
      code: itemsError.code,
      error: itemsError,
    });
    // Rollback order creation
    await supabase.from("orders").delete().eq("id", orderId);
    return NextResponse.json({ 
      error: itemsError.message || "Failed to create order items",
      details: itemsError.details || itemsError.hint || undefined
    }, { status: 400 });
  }

  // Verify items were created - use a simple count query
  // Note: This might hit RLS but it's just for verification/logging
  console.log(`Order created with ID: ${orderId}`);
  console.log(`Attempted to create ${orderItems.length} order items`);

  // Update product stock quantities
  for (const cartItem of cartItems) {
    const product = cartItem.products as any;
    await supabase
      .from("products")
      .update({
        stock_quantity: product.stock_quantity - cartItem.quantity,
      })
      .eq("id", product.id);
  }

  // Clear cart
  await supabase
    .from("cart_items")
    .delete()
    .eq("buyer_id", user.id);

  return NextResponse.json({ success: true, orderId: orderId, orderNumber });
}


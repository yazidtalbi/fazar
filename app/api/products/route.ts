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

  const body = await request.json();
  const {
    storeId,
    title,
    categoryId,
    condition,
    description,
    price,
    stockQuantity,
    daysToCraft,
    mediaUrls,
  } = body;

  // Verify store ownership
  const { data: store } = await supabase
    .from("stores")
    .select("seller_id")
    .eq("id", storeId)
    .single();

  if (!store || store.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      category_id: categoryId || null,
      title,
      description: description || null,
      price: parseFloat(price),
      condition: condition || "new",
      stock_quantity: parseInt(stockQuantity) || 0,
      days_to_craft: parseInt(daysToCraft) || 0,
      status: "active",
    })
    .select("id")
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: productError?.message || "Failed to create product" }, { status: 400 });
  }

  // Create product media entries
  if (mediaUrls && mediaUrls.length > 0) {
    const mediaEntries = mediaUrls.map((url: string, index: number) => {
      const isVideo = url.includes("/video/") || url.match(/\.(mp4|webm|ogg)$/i);
      return {
        product_id: product.id,
        media_url: url,
        media_type: isVideo ? "video" : "image",
        mime_type: isVideo ? "video/mp4" : "image/jpeg",
        order_index: index,
        is_cover: index === 0,
      };
    });

    const { error: mediaError } = await supabase
      .from("product_media")
      .insert(mediaEntries);

    if (mediaError) {
      console.error("Media insert error:", mediaError);
      // Don't fail the request, product is created
    }
  }

  return NextResponse.json({ success: true, productId: product.id });
}


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
    keywords,
    materials,
    size,
    weight,
    price,
    promotedPrice,
    promotedStartDate,
    promotedEndDate,
    stockQuantity,
    daysToCraft,
    deliveryEstimateDays,
    deliveryConditions,
    returnPolicy,
    shippingCost,
    shippingOriginCountry,
    mediaUrls,
    variations,
    personalizations,
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
  const productData: any = {
    store_id: storeId,
    category_id: categoryId || null,
    title,
    description: description || null,
    keywords: keywords || null,
    materials: materials || null,
    size: size || null,
    weight: weight || null,
    price: parseFloat(price),
    condition: condition || "new",
    stock_quantity: parseInt(stockQuantity) || 0,
    days_to_craft: parseInt(daysToCraft) || 0,
    delivery_estimate_days: deliveryEstimateDays || 0,
    delivery_conditions: deliveryConditions || null,
    return_policy: returnPolicy || null,
    shipping_cost: shippingCost || null,
    shipping_origin_country: shippingOriginCountry || null,
    status: "active",
  };

  // Add promoted price if provided
  if (promotedPrice && parseFloat(promotedPrice) > 0) {
    productData.promoted_price = parseFloat(promotedPrice);
    productData.is_promoted = true;
    if (promotedStartDate) {
      productData.promoted_start_date = promotedStartDate;
    }
    if (promotedEndDate) {
      productData.promoted_end_date = promotedEndDate;
    }
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(productData)
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

  // Create product variations
  if (variations && Array.isArray(variations) && variations.length > 0) {
    for (const variation of variations) {
      const { data: variationData, error: variationError } = await supabase
        .from("product_variations")
        .insert({
          product_id: product.id,
          name: variation.name,
          display_name: null,
          is_required: variation.isRequired !== false,
          order_index: variations.indexOf(variation),
        })
        .select("id")
        .single();

      if (variationData && variation.options && Array.isArray(variation.options)) {
        const optionEntries = variation.options.map((option: any, optIdx: number) => ({
          variation_id: variationData.id,
          value: option.value,
          display_value: option.displayValue || null,
          price_modifier: parseFloat(option.priceModifier) || 0,
          stock_quantity: option.stockQuantity ? parseInt(option.stockQuantity) : null,
          order_index: optIdx,
        }));

        await supabase.from("product_variation_options").insert(optionEntries);
      }
    }
  }

  // Create product personalizations
  if (personalizations && Array.isArray(personalizations) && personalizations.length > 0) {
    const personalizationEntries = personalizations.map((personalization: any, idx: number) => ({
      product_id: product.id,
      label: personalization.label,
      placeholder: personalization.placeholder || null,
      max_length: personalization.maxLength || 100,
      is_required: personalization.isRequired || false,
      price_modifier: parseFloat(personalization.priceModifier) || 0,
      order_index: idx,
    }));

    await supabase.from("product_personalizations").insert(personalizationEntries);
  }

  return NextResponse.json({ success: true, productId: product.id });
}


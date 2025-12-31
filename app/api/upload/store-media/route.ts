import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const storeId = formData.get("storeId") as string;
  const type = formData.get("type") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Verify store ownership
  const { data: store } = await supabase
    .from("stores")
    .select("seller_id")
    .eq("id", storeId)
    .single();

  if (!store || store.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File size exceeds limit. Max 10MB` },
      { status: 400 }
    );
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `stores/${storeId}/${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to Supabase Storage using service client (bypasses RLS)
  const serviceClient = createServiceClient();
  
  const { data: uploadData, error: uploadError } = await serviceClient.storage
    .from("store-media")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = serviceClient.storage.from("store-media").getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl, path: uploadData.path });
}


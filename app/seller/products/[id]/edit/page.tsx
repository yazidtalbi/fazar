import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ProductEditForm } from "@/components/seller/product-edit-form";

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    redirect("/onboarding/seller");
  }

  // Get product and verify ownership
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      product_media(*),
      categories(id, name, slug)
    `)
    .eq("id", id)
    .eq("store_id", store.id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
        <ProductEditForm product={product} categories={categories || []} storeId={store.id} />
      </div>
    </div>
  );
}


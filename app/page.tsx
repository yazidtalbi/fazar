import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Redirect logged-in users to app
    redirect("/app");
  }

  // Redirect guests to welcome page
  redirect("/welcome");
}

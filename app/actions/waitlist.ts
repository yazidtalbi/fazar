"use server";

import { createClient } from "@/lib/supabase/server";

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email");

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const supabase = await createClient();

    // Check if waitlist table exists by trying to insert.
    // Assuming migration 021_waitlist.sql was run.
    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    if (error) {
      // If error is unique violation, they are already on the list.
      if (error.code === '23505') {
         return { success: true, message: "You are already on the waitlist!" };
      }
      console.error("Waitlist insert error:", error);
      return { error: "Something went wrong. Please try again later." };
    }

    return { success: true, message: "Thanks for joining our waitlist!" };
  } catch (error) {
    console.error("Waitlist server action error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

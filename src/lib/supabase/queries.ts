import { supabase } from "@/lib/supabase/client";

export const getAllProfiles = async () => {
  const { data, error } = await supabase.from("profiles").select("*");

  if (error) {
    console.error("Error fetching profiles:", error.message);
    return [];
  }

  return data;
};

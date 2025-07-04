"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (data?.session) {
        // User is confirmed and logged in
        router.push("/dashboard");
      } else {
        // Show error or redirect to login
        router.push("/signin");
      }
    };

    handleAuth();
  }, [router]);

  return <p className="text-center">Completing sign-up...</p>;
}

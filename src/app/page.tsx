"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser } from "@/lib/appwrite/auth";

export default function Home() {
  const [section, setSection] = useState<null | Awaited<ReturnType<typeof getUser>>>(null)
  const navigate = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const user = await getUser();

        setSection(user)
      } catch (err) {
        console.log("Failed to fetch section", err);
      }
    };

    fetchSection();
  }, []);

  useEffect(() => {
    if (section && pathname !== "/dashboard") {
      navigate.replace('/dashboard')
    }else {
      navigate.replace('/signin')
    }
  }, [section, pathname, navigate]);




  return null;
}



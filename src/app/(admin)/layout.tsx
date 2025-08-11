"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { getUser } from "@/lib/appwrite/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const router = useRouter();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const data = await getUser();
      setSessionInfo(data);
      setLoading(false);
    };
    fetchSession();
  }, []);

  // Redirect if no session
  useEffect(() => {
    if (!loading && !sessionInfo) {
      router.replace("/signin");
    }
  }, [loading, sessionInfo, router]);

  // Setup JivoChat visitor info after user and script are ready
  useEffect(() => {
    if (!sessionInfo) return;

    // Define the callback for JivoChat API ready event
    (window as any).jivo_onLoad = function () {
      if ((window as any).jivo_api && typeof (window as any).jivo_api.setVisitorInfo === "function") {
        (window as any).jivo_api.setVisitorInfo({
          name: sessionInfo.name,
          email: sessionInfo.email,
          custom_fields: {
            appwriteUserId: sessionInfo.$id,
          },
        });
      }
    };
  }, [sessionInfo]);

  if (loading || !sessionInfo) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}

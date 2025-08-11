"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { getUser } from "@/lib/appwrite/auth";
import { useRouter } from "next/navigation";
import Script from "next/script";
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

  const [sessionInfo, setSessionInfo] = useState<ReturnType<typeof getUser> extends Promise<infer T> ? T | null : null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const data = await getUser();
      setSessionInfo(data);
      setLoading(false);
    };
    fetchSession();
  }, []);

  // Redirect if no session, but only after initial check
  useEffect(() => {
    if (!loading && !sessionInfo) {
      router.replace("/signin")
    }
  }, [loading, sessionInfo, router]);

  if (loading || !sessionInfo) {
    // Prevents premature render while checking session
    return null;
  }


  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
      <Script src="//code.jivosite.com/widget/w6GDGUb46u" async></Script>
    </div>
  );
}

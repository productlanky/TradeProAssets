import { Metadata } from "next";
import React from "react";
import ProfilePage from "@/components/user-profile/ProfilePage";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};


export default function Profile() {
  return (
    <ProfilePage />
  );
}

import { Metadata } from "next";
import React from "react";
import ProfilePage from "@/components/user-profile/ProfilePage";

export const metadata: Metadata = {
  title: "Trade Pro - Blockchain Company",
  description:
    "Earn huge return on investment. With our professional team of Traders, you are guaranteed of your earnings.",
};



export default function Profile() {
  return (
    <ProfilePage />
  );
}

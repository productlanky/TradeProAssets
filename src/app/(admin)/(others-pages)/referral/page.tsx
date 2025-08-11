import ReferralPage from "@/components/referral-system/ReferralPage";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Trade Pro - Blockchain Company",
  description:
    "Earn huge return on investment. With our professional team of Traders, you are guaranteed of your earnings.",
};



export default function Referral() {
    return (
        <ReferralPage />
    );
}

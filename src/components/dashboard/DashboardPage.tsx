"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import React from "react";
import RecentOrders from "../ecommerce/RecentOrders";
import MonthlyTarget from "../ecommerce/MonthlyTarget";
import { EcommerceMetrics } from "../ecommerce/EcommerceMetrics";
import QuickLinks from "./QuickLinks";
import CopyLinkInput from "../form/group-input/CopyLinkInput";
import { Skeleton } from "../ui/skeleton"; 
import Alert from "../ui/alert/Alert";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [kycStatus, setKycStatus] = useState<string | null>(null);
    const [tierName, setTierName] = useState("Unknown");
    const [referralCount, setReferralCount] = useState(0);
    const [activeInvestments, setActiveInvestments] = useState(0);
    const [referralLink, setReferralLink] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // Get KYC status from latest kyc_requests
            const { data: kycData } = await supabase
                .from("kyc_requests")
                .select("status")
                .eq("user_id", user.id)
                .order("submitted_at", { ascending: false })
                .limit(1);

            const kycStatus = kycData?.[0]?.status ?? null;
            setKycStatus(kycStatus);

            if (kycStatus !== "approved") {
                setLoading(false); // show alert, block rest
                return;
            }

            // Get profile with tier and referral_code
            const { data: profileData } = await supabase
                .from("profiles")
                .select("referral_code, tier_level, tiers(name)")
                .eq("id", user.id)
                .single();

            const referralCode = profileData?.referral_code;
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";
            setReferralLink(`${baseUrl}/signup?ref=${referralCode}`);

            // Set tier name
            let tier = "Unknown";
            if (Array.isArray(profileData?.tiers) && profileData.tiers.length > 0) {
                tier = profileData.tiers[0]?.name ?? "Unknown";
            } else if (
                profileData?.tiers &&
                typeof profileData.tiers === "object" &&
                "name" in profileData.tiers
            ) {
                tier = (profileData.tiers as { name: string }).name ?? "Unknown";
            }
            setTierName(tier);

            // Referrals
            const { count: referralCount } = await supabase
                .from("referrals")
                .select("*", { count: "exact", head: true })
                .eq("referrer_id", user.id);
            setReferralCount(referralCount ?? 0);

            // Active investments
            const { count: activeInvestments } = await supabase
                .from("user_investments")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("status", "active");
            setActiveInvestments(activeInvestments ?? 0);

            setLoading(false);
        };

        fetchData();
    }, []);

    const showKycAlert = kycStatus !== "approved";

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            {showKycAlert && (
                <div className="col-span-12">
                    <Alert variant="warning" title="KYC Required" linkHref="/profile" linkText="Update KYC" showLink message="You must submit and get your KYC approved to use your dashboard.
              Please go to the KYC page to complete verification.">
                    </Alert>
                </div>
            )}

            <div className="col-span-12 space-y-6 xl:col-span-7">
                {loading || showKycAlert ? (
                    <>
                        <Skeleton className="h-[140px] w-full rounded-xl" />
                        <Skeleton className="h-[140px] w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </>
                ) : (
                    <>
                        <EcommerceMetrics />
                        <QuickLinks />
                        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <CopyLinkInput link={referralLink} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="col-span-12 xl:col-span-5">
                {loading || showKycAlert ? (
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : (
                    <MonthlyTarget
                        loading={false}
                        tierName={tierName}
                        referralCount={referralCount}
                        activeInvestments={activeInvestments}
                    />
                )}
            </div>

            <div className="col-span-12">
                {loading || showKycAlert ? (
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : (
                    <RecentOrders />
                )}
            </div>
        </div>
    );
}

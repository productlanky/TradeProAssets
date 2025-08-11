"use client";

import { useEffect, useState } from "react";

import React from "react";
import RecentOrders from "../ecommerce/RecentOrders";
import MonthlyTarget from "../ecommerce/MonthlyTarget";
import { EcommerceMetrics } from "../ecommerce/EcommerceMetrics";
import QuickLinks from "./QuickLinks";
import CopyLinkInput from "../form/group-input/CopyLinkInput";
import { Skeleton } from "../ui/skeleton";
import Alert from "../ui/alert/Alert";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, INVESTMENT_COLLECTION, PROFILE_COLLECTION_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { Query } from "appwrite";
// import { set } from "date-fns";
import { tierList } from "@/lib/data/info";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [kycStatus, setKycStatus] = useState<string | null>(null);
    const [tierName, setTierName] = useState("Unknown");
    const [referralCount, setReferralCount] = useState(0);
    const [activeInvestments, setActiveInvestments] = useState(0);
    const [referralLink, setReferralLink] = useState("");



    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const user = await getUser();

            if (!user) return;

            try {
                const response = await databases.listDocuments(
                    DB_ID,
                    PROFILE_COLLECTION_ID,
                    [Query.equal("userId", user.$id)]
                );

                const userProfile = response.documents[0];

                if (!userProfile) {
                    console.warn("No profile found for user.");
                    return;
                }

                const referralCode = userProfile?.refereeId;
                setKycStatus(userProfile?.kycStatus || "unknown");

                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";
                setReferralLink(`${baseUrl}/signup?ref=${referralCode}`);


                const referralsList = await databases.listDocuments(
                    DB_ID,
                    PROFILE_COLLECTION_ID,
                    [Query.equal("referredBy", userProfile.refereeId)] // or profileDoc.referralCode depending on schema
                );

                setReferralCount(referralsList.total);



                const investmentList = await databases.listDocuments(
                    DB_ID,
                    INVESTMENT_COLLECTION,
                    [Query.equal("userId", user.$id),
                    Query.equal("status", "active")
                    ]
                );

                setActiveInvestments(investmentList.total);

                const deposits = await databases.listDocuments(
                    DB_ID,
                    TRANSACTION_COLLECTION,
                    [
                        Query.equal("userId", user.$id),
                        Query.equal("type", "deposit"),
                        Query.equal("status", "approved")
                    ]
                );

                const totalDeposit = deposits?.documents?.reduce(
                    (sum, tx) => sum + (Number(tx.amount) || 0),
                    0
                ) || 0;

                const currentTier = tierList
                    // Make sure we're working with a copy so we don't mutate the original
                    .slice()
                    // Sort ascending by deposit first, then referrals
                    .sort((a, b) => {
                        if (a.deposit === b.deposit) {
                            return a.referrals - b.referrals;
                        }
                        return a.deposit - b.deposit;
                    })
                    // Filter only tiers the user qualifies for
                    .filter(tier =>
                        totalDeposit >= Number(tier.deposit) &&
                        referralsList.total >= Number(tier.referrals)
                    )
                    // Pick the last one (highest qualified)
                    .pop();

                setTierName(currentTier ? currentTier.name : "Unknown");

            } catch (error) {
                console.log("Error fetching profile:", error);
            }

            setLoading(false);
        };

        fetchUser();
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

            <div className="col-span-12 space-y-6 xl:col-span-7 flex flex-col ">
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
                    </>
                )}
            </div>

            <div className="col-span-12 xl:col-span-5 space-y-5">
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

                {loading || showKycAlert ? (
                    <Skeleton className="h-[40px] w-full rounded-xl" />
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <CopyLinkInput link={referralLink} />
                        </div>
                    </div>
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

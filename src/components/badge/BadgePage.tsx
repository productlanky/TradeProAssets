"use client";

import { useEffect, useState } from "react"; 
import { Progress } from "@/components/ui/progress";
import TierProgressCard from "./TierProgressCard";
import TiersOverview from "./TiersOverview";
import { tierList } from "@/lib/data/info";
import { databases, DB_ID, PROFILE_COLLECTION_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { getUser } from "@/lib/appwrite/auth";

export default function BannerPage() {
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeTier, setActiveTier] = useState(tierList[0]);
  const [nextTier, setNextTier] = useState<typeof tierList[0] | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getUser().catch(() => null);
        if (!user) return;

        const profileRes = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("userId", user.$id)]
        );
        const profileDoc = profileRes.documents[0];

        // Get approved deposits
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

        // Get referrals
        const referralsList = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("referredBy", profileDoc.refereeId)] // or profileDoc.referralCode depending on schema
        );

        const totalReferralCount = referralsList.total;

        // Update state
        setTotalDeposits(totalDeposit);
        setTotalReferrals(totalReferralCount);

        // Calculate current and next tier using local vars (avoids async state issues)
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
            totalReferralCount >= Number(tier.referrals)
          )
          // Pick the last one (highest qualified)
          .pop();

        setActiveTier(currentTier || tierList[0]);

        const nextTier = tierList.find(
          tier => tier.deposit > totalDeposit || tier.referrals > totalReferralCount
        );
        setNextTier(nextTier || null);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);



  console.log("Next Tier:", nextTier);


  const getProgressToNextTier = () => {
    if (!nextTier) return 100;
    const depositProgress = Math.min(
      100,
      ((totalDeposits - activeTier.deposit) /
        (nextTier.deposit - activeTier.deposit)) * 100
    );
    const referralProgress = Math.min(
      100,
      ((totalReferrals - activeTier.referrals) /
        (nextTier.referrals - activeTier.referrals)) * 100
    );
    return Math.round((depositProgress + referralProgress) / 2);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10 pt-5 space-y-8">
      <TierProgressCard
        totalDeposits={totalDeposits}
        totalReferrals={totalReferrals}
        activeTier={activeTier}
      />

      <TiersOverview
        tierList={tierList}
        activeTier={activeTier}
        userDeposits={totalDeposits}
        userReferrals={totalReferrals}
      />




      {/* Progress */}
      {nextTier ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Progress to{" "}
              <span className="text-primary font-bold">{nextTier.name}</span> Tier
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {totalDeposits < nextTier.deposit &&
                `Deposit $${nextTier.deposit - totalDeposits} more `}
              {totalDeposits < nextTier.deposit &&
                totalReferrals < nextTier.referrals &&
                `and `}
              {totalReferrals < nextTier.referrals &&
                `Refer ${nextTier.referrals - totalReferrals} more users `}
              to reach <strong>{nextTier.name}</strong> tier.
            </p>
          </div>

          <Progress value={getProgressToNextTier()} className="h-3 rounded-lg" />

          <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
            You&apos;re {getProgressToNextTier()}% of the way there 🚀
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
            🎉 You&apos;ve unlocked the highest tier!
          </h3>
          <p className="text-sm text-muted-foreground">
            Welcome to the <strong>Diamond</strong> tier.
          </p>
        </div>
      )}
      {/* End Progress */}
    </div>
  );
}

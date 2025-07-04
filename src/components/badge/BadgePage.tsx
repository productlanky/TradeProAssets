"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import TierProgressCard from "./TierProgressCard";
import TiersOverview from "./TiersOverview";
import { tierList } from "@/lib/data/info";

export default function BannerPage() {
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeTier, setActiveTier] = useState(tierList[0]);
  const [nextTier, setNextTier] = useState<typeof tierList[0] | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: deposits } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "deposit")
        .eq("status", "approved");

      const totalDeposit = deposits?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
      setTotalDeposits(totalDeposit);

      const { data: referrals } = await supabase
        .from("referrals")
        .select("*")
        .eq("referred_by", user.id);

      const totalReferral = referrals?.length || 0;
      setTotalReferrals(totalReferral);

      const current = [...tierList].reverse().find(
        (tier) => totalDeposit >= tier.deposit && totalReferral >= tier.referrals
      );
      setActiveTier(current || tierList[0]);

      const next = tierList.find(
        (tier) =>
          tier.deposit > totalDeposit || tier.referrals > totalReferral
      );
      setNextTier(next || null);
    }

    fetchData();
  }, []);

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

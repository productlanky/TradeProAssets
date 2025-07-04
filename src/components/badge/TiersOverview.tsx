import { 
  Lock,
  TrendingUp,
  UsersRound,
  Zap,
  Medal,
  Shield,
  Award,
  Trophy,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tierIcons = {
  Bronze: <Medal className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
  Silver: <Shield className="w-6 h-6 text-gray-400 dark:text-gray-300" />,
  Gold: <Award className="w-6 h-6 text-amber-400 dark:text-amber-300" />,
  Platinum: <Trophy className="w-6 h-6 text-indigo-400 dark:text-indigo-300" />,
  Diamond: <Crown className="w-6 h-6 text-blue-400 dark:text-blue-300" />,
};

interface Tier {
  name: keyof typeof tierIcons;
  deposit: number;
  referrals: number;
  boost: number;
  color?: string;
}

interface TiersOverviewProps {
  tierList: Tier[];
  activeTier: Tier;
  userDeposits: number;
  userReferrals: number;
}

export default function TiersOverview({
  tierList,
  activeTier,
  userDeposits,
  userReferrals,
}: TiersOverviewProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Tiers Overview
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tierList.map((tier) => {
          const isActive = tier.name === activeTier.name;
          const isUnlocked =
            userDeposits >= tier.deposit && userReferrals >= tier.referrals;

          return (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-2xl border p-5 text-center shadow-sm overflow-hidden group transition duration-200",
                isActive
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
              )}
            >
              {/* Overlay Lock */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/70 flex items-center justify-center z-10 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <Lock className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                </div>
              )}

              <div className="relative z-0 space-y-3">
                {/* Tier Icon */}
                <div className="flex justify-center">{tierIcons[tier.name]}</div>

                <p
                  className={cn(
                    "text-base font-semibold",
                    isActive
                      ? "text-green-700 dark:text-green-300"
                      : "text-gray-800 dark:text-white/90"
                  )}
                >
                  {tier.name}
                </p>

                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>${tier.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <UsersRound className="w-4 h-4" />
                    <span>{tier.referrals} referrals</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>+{tier.boost}% boost</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

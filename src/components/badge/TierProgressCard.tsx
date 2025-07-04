import { TrophyIcon, TrendingUp, UsersRound } from "lucide-react";

interface TierProgressProps {
    totalDeposits: number;
    totalReferrals: number;
    activeTier: {
        name: string;
        boost: number;
    };
}

export default function TierProgressCard({
    totalDeposits,
    totalReferrals,
    activeTier,
}: TierProgressProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Deposits */}
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
                    <TrendingUp className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Deposits</span>
                    <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                        ${totalDeposits.toLocaleString()}
                    </h4>
                </div>
            </div>

            {/* Referrals */}
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
                    <UsersRound className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Referrals</span>
                    <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                        {totalReferrals}
                    </h4>
                </div>
            </div>

            {/* Tier */}
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-900/20">
                    <TrophyIcon className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Active Tier</span>
                    <div className="flex items-baseline gap-2">
                        <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                            {activeTier.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{activeTier.boost}% Boost</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

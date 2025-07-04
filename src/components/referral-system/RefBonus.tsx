// components/RefBonus.tsx

import React from "react";
import { GiftIcon, UsersIcon } from "lucide-react";

type RefBonusProps = {
  totalReferred: number;
  referralBonus: number;
};

export default function RefBonus({ totalReferred, referralBonus }: RefBonusProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Referrals */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <UsersIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Referral</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {totalReferred}
          </h4>
        </div>
      </div>

      {/* Total Bonus */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GiftIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Bonus</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {referralBonus}
          </h4>
        </div>
      </div>
    </div>
  );
}

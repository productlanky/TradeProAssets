"use client";
import React, { useEffect, useState } from "react"; 
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "../ui/skeleton";
import {
  WalletIcon,
  BanknoteIcon,
} from "lucide-react"; // Correct icons for money
// import Badge from "../ui/badge/Badge"; // optional if needed

export const EcommerceMetrics = () => { 
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [totalDeposit, setTotalDeposit] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      const { data: deposits } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "deposit")
        .eq("status", "approved");

      const total = deposits?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setBalance(profile?.balance || 0);
      setTotalDeposit(total);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Balance */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <WalletIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            {loading ? <Skeleton className="h-6 w-24" /> : `$${balance?.toFixed(2)}`}
          </h4>
        </div>
      </div>

      {/* Total Deposit */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BanknoteIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Total Deposit</span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            {loading ? <Skeleton className="h-6 w-24" /> : `$${totalDeposit?.toFixed(2)}`}
          </h4>
        </div>
      </div>
    </div>
  );
};

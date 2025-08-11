"use client";
import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import {
  WalletIcon,
  BanknoteIcon,
} from "lucide-react"; // Correct icons for money
import { databases, DB_ID, PROFILE_COLLECTION_ID, STOCKLOG_COLLECTION_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { getUser } from "@/lib/appwrite/auth";
import { RiStockFill } from "react-icons/ri";
// import Badge from "../ui/badge/Badge"; // optional if needed

export const EcommerceMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [totalDeposit, setTotalDeposit] = useState<number | null>(null);
  const [totalShares, setTotalShare] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = await getUser();
      if (!user) return;

      try {
        const response = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("userId", user.$id)]
        );

        const profile = response.documents[0];


        const transaction = await databases.listDocuments(
          DB_ID,
          TRANSACTION_COLLECTION,
          [
            Query.equal("userId", user.$id),
            Query.equal("type", "deposit"), // Only deposits
            Query.equal("status", "approved") // Only approved deposits
          ]
        );

        const total = transaction?.documents?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;


        // Get all transactions for the current user
        const { documents } = await databases.listDocuments(DB_ID, STOCKLOG_COLLECTION_ID, [
          Query.equal("userId", user.$id)
        ]);

        // Sum quantities (positive for buys, negative for sells)
        const totalShare = documents.reduce((sum, tx) => sum + (tx.shares || 0), 0) || 0;


        setBalance(profile?.balance || 0);
        setTotalShare(totalShare)
        setTotalDeposit(total);
        setProfit(profile?.profit || 0)
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

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

      {/* Shares */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <RiStockFill size={20} className="text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Shares</span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            {loading ? <Skeleton className="h-6 w-24" /> : `${totalShares?.toFixed(2)}`}
          </h4>
        </div>
      </div>

      {/* Deposit */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BanknoteIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Profits</span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            {loading ? <Skeleton className="h-6 w-24" /> : `$${profit?.toFixed(2)}`}
          </h4>
        </div>
      </div>
    </div>
  );
};

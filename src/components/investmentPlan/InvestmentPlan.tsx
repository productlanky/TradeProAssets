"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../ui/button/Button";
import { toast } from "sonner";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, INVESTMENT_COLLECTION, PROFILE_COLLECTION_ID } from "@/lib/appwrite/client";
import { ID, Query } from "appwrite";
import { plan } from "@/lib/data/info";

type InvestmentPlan = {
  id: string;
  name: string;
  description: string;
  interest_rate: number;
  duration_days: number;
  min_amount: number;
};

export default function InvestmentPlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [investing, setInvesting] = useState<string | null>(null);
  const [investment, setInvestment] = useState<string | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      const user = await getUser();
      if (!user) return;

      const res = await databases.listDocuments(DB_ID, PROFILE_COLLECTION_ID, [
        Query.equal("userId", user.$id),
      ]);

      if (res.documents.length === 0) {
        toast.error("Profile not found.");
        return;
      }

      setProfileId(res.documents[0].$id);

      try {
        const response = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("userId", user.$id)]
        );

        const profile = response.documents[0];
        if (!profile) {
          toast.error("Failed to fetch balance");
          return;
        }
        setBalance(profile?.balance || 0);
        setUserId(user.$id);
        setPlans(plan);

        // 🔥 Fetch user's last investment, sorted by start_date descending
        const investmentRes = await databases.listDocuments(DB_ID, INVESTMENT_COLLECTION, [
          Query.equal("userId", user.$id),
          Query.orderDesc("startDate"),
          Query.limit(1),
        ]);

        if (investmentRes.documents.length > 0) {
          const lastInvestment = investmentRes.documents[0];
          const now = new Date();
          const endDate = new Date(lastInvestment.endDate);

          if (now > endDate) {
            // ✅ Investment has expired
            console.log("Investment has expired.");
            setInvestment("expired"); // or setHasExpired(true)
          } else {
            // ✅ Investment is still active
            console.log("Investment is still active.");
            setInvestment(lastInvestment.planId); // or setHasExpired(false)
          }
        }

      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleInvest = async (plan: InvestmentPlan) => {
    if (!userId || !profileId) return;

    if (balance < plan.min_amount) {
      toast.error("Insufficient balance for this investment plan.");
      return;
    }

    setInvesting(plan.id);

    const startedAt = new Date();
    const endAt = new Date();
    endAt.setDate(startedAt.getDate() + plan.duration_days);

    try {
      // 1. Create investment document
      await databases.createDocument(DB_ID, INVESTMENT_COLLECTION, ID.unique(), {
        userId,
        planId: plan.id,
        amount: plan.min_amount,
        status: "active",
        startDate: startedAt.toISOString(),
        endDate: endAt.toISOString(),
      });

      // 2. Update balance in profile
      await databases.updateDocument(DB_ID, PROFILE_COLLECTION_ID, profileId, {
        balance: balance - plan.min_amount,
      });

      // 3. Show success
      toast.success(`Investment in "${plan.name}" started successfully.`);
      setBalance((prev) => prev - plan.min_amount);
    } catch (error) {
      console.error("Investment error:", error);
      toast.error("Failed to start investment. See console for details.");
    } finally {
      setInvesting(null);
    }
  };


  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (!plans.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No investment plans available at the moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="group flex flex-col justify-between border rounded-2xl p-5 shadow-sm bg-white dark:bg-white/[0.02] dark:border-white/[0.05] hover:shadow-md transition"
        >
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-primary transition mb-1">
              {plan.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {plan.description}
            </p>

            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <span className="font-medium">Interest Rate:</span>{" "}
                {(plan.interest_rate * 100).toFixed(2)}%
              </li>
              <li>
                <span className="font-medium">Duration:</span>{" "}
                {plan.duration_days} days
              </li>
              <li>
                <span className="font-medium">Minimum Amount:</span> $
                {plan.min_amount}
              </li>
            </ul>
          </div>

          <Button
            variant="outline"
            className="mt-5"
            onClick={() => handleInvest(plan)}
            disabled={investing === plan.id || investment === plan.id}
          >
            {investing === plan.id ? "Processing..." : "Start Investment"}
            <ArrowRight size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}

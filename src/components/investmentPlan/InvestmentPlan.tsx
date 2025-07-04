"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import Button from "../ui/button/Button";
import { toast } from "sonner";

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
  const [balance, setBalance] = useState<number>(0);
  const [investing, setInvesting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (profileError) {
        toast.error("Failed to fetch balance");
        return;
      }

      setBalance(profile?.balance || 0);

      const { data, error } = await supabase
        .from("investment_plans")
        .select("*")
        .order("min_amount", { ascending: true });

      if (error) {
        toast.error("Error fetching investment plans");
      } else {
        setPlans(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

const handleInvest = async (plan: InvestmentPlan) => {
  if (!userId) return;

  if (balance < plan.min_amount) {
    toast.error("Insufficient balance for this investment plan.");
    return;
  }

  setInvesting(plan.id);

  const startedAt = new Date();
  const endAt = new Date();
  endAt.setDate(startedAt.getDate() + plan.duration_days);

  const { error: insertError } = await supabase.from("user_investments").insert({
    user_id: userId,
    plan_id: plan.id,
    amount: plan.min_amount,
    status: "active",
    start_date: startedAt.toISOString(),
    end_date: endAt.toISOString(), // ← this might be null or misnamed
  });

  if (insertError) {
    console.log("Insert error:", insertError);
    toast.error("Failed to start investment. Check console for details.");
    setInvesting(null);
    return;
  }

  // Deduct balance
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: balance - plan.min_amount })
    .eq("id", userId);

  if (updateError) {
    console.log("Balance update error:", updateError);
    toast.warning("Investment saved but failed to update balance.");
  }

  toast.success(`Investment in "${plan.name}" started successfully.`);
  setBalance((prev) => prev - plan.min_amount);
  setInvesting(null);
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
            disabled={investing === plan.id}
          >
            {investing === plan.id ? "Processing..." : "Start Investment"}
            <ArrowRight size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}

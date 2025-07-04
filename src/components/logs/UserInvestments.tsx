"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Skeleton } from "../ui/skeleton";

type Investment = {
  id: string;
  amount: number;
  status: string;
  start_date: string;
  end_date: string | null;
  investment_plans: {
    name: string;
    interest_rate: number;
    duration_days: number;
  };
};

export default function UserInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User fetch error:", userError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_investments")
        .select(`
          id,
          amount,
          status,
          start_date,
          end_date,
          investment_plans (
            name,
            interest_rate,
            duration_days
          )
        `)
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Investments fetch error:", error.message);
      } else if (data) {
        setInvestments(
          data.map((inv: any) => ({
            ...inv,
            investment_plans: Array.isArray(inv.investment_plans)
              ? inv.investment_plans[0]
              : inv.investment_plans,
          }))
        );
      }

      setLoading(false);
    };

    fetchInvestments();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge color="info" size="sm">Active</Badge>;
    if (status === "completed") return <Badge color="success" size="sm">Completed</Badge>;
    return <Badge color="error" size="sm">{status}</Badge>;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[950px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Plan
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Interest
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Duration
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Start Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  End Date
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((__, j) => (
                      <TableCell key={j} className="px-5 py-4">
                        <Skeleton className="h-4 w-full max-w-[100px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : investments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    You have no investments yet.
                  </TableCell>
                </TableRow>
              ) : (
                investments.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {inv.investment_plans.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      ${inv.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      {(inv.investment_plans.interest_rate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      {inv.investment_plans.duration_days} days
                    </TableCell>
                    < TableCell className="px-5 py-4">{
                      inv.start_date === inv.end_date ? getStatusBadge('completed') : getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400">
                      {new Date(inv.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400">
                      {inv.end_date
                        ? new Date(inv.end_date).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

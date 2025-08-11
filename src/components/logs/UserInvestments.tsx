"use client";

import React, { useEffect, useState } from "react"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Skeleton } from "../ui/skeleton";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, INVESTMENT_COLLECTION } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { plan } from "@/lib/data/info";

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
      try {
        const user = await getUser();

        // Fetch investments by userId
        const { documents } = await databases.listDocuments(DB_ID, INVESTMENT_COLLECTION, [
          Query.equal("userId", user.$id),
          Query.orderDesc("startDate"),
        ]);

        // If you need to fetch each related plan separately
        setInvestments(
          documents.map((inv: any) => {

            const today = new Date();
            const endDate = inv.end_date ? new Date(inv.end_date) : null;

            // If end date is set and it's today or earlier, mark as completed
            let computedStatus = inv.status;
            if (endDate && endDate <= today) {
              computedStatus = "completed";
            } else if (!endDate || endDate > today) {
              computedStatus = "active";
            }

            // Find the plan that matches the investment's plan_id or similar key
            const matchedPlan = plan.find((p) => p.id === inv.planId) || plan[0];
            return {
              id: inv.$id || inv.id,
              amount: Number(inv.amount),
              status: computedStatus,
              start_date: inv.startDate,
              end_date: inv.endDate ?? null,
              investment_plans: matchedPlan,
            };
          }))

      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching user or investments:", err.message);
        } else {
          console.error("Error fetching user or investments:", err);
        }
      } finally {
        setLoading(false);
      }
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

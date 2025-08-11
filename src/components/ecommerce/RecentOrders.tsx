"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge"; 
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { Query } from "appwrite";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  created_at: string;
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = await getUser();
      if (!user) return;

      try {
        const response = await databases.listDocuments(
          DB_ID,
          TRANSACTION_COLLECTION,
          [Query.equal("userId", user.$id)]
        );

        const transactions: Transaction[] = response.documents.map((doc) => ({
          id: doc.$id || doc.id,
          type: doc.type,
          amount: Number(doc.amount),
          status: doc.status,
          created_at: doc.$createdAt,
        }));

        setTransactions(transactions || []);

      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      setLoading(false);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Transactions
        </h3>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          See all
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Type</TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Amount</TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Date</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
              : transactions.length > 0
                ? transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="py-3 text-theme-sm text-gray-800 capitalize dark:text-white/90">
                      {tx.type.replace("_", " ")}
                    </TableCell>
                    <TableCell className="py-3 text-theme-sm text-gray-700 dark:text-gray-300">
                      ${tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3 text-theme-sm">
                      <Badge
                        size="sm"
                        color={
                          tx.status == "approved"
                            ? "success"
                            : tx.status == "pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">
                      No recent transactions found.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

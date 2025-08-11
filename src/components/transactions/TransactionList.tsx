"use client";

import React, { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Skeleton } from "../ui/skeleton";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { Query } from "appwrite";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = await getUser(); // Your helper to get logged-in Appwrite user
        if (!user) {
          console.error("Failed to get user.");
          setLoading(false);
          return;
        }

        const response = await databases.listDocuments(DB_ID, TRANSACTION_COLLECTION, [
          Query.equal("userId", user.$id),
          Query.orderDesc("$createdAt")
        ]);

        setTransactions(
          (response.documents || []).map((doc) => ({
            id: doc.$id,
            type: doc.type,
            amount: doc.amount,
            status: doc.status,
            created_at: doc.$createdAt,
          }))
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching transactions:", error.message);
        } else {
          console.error("Error fetching transactions:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[720px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="px-5 py-4 text-start capitalize text-theme-sm text-gray-700 dark:text-gray-300">
                      {tx.type.replace("_", " ")}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-300">
                      ${tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-300">
                      <Badge
                        size="sm"
                        color={
                          tx.status === "approved"
                            ? "success"
                            : tx.status === "pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-300">
                      {new Date(tx.created_at).toLocaleString()}
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

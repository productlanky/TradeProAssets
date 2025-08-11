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
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, STOCKLOG_COLLECTION_ID } from "@/lib/appwrite/client";
import { Query } from "appwrite";

type StockLog = {
  id: string;
  shares: number;
  amount: number;
  pricePerShare: number;
  status: string;
  date: string;
};

export default function ShareLogs() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const user = await getUser();

        const { documents } = await databases.listDocuments(
          DB_ID,
          STOCKLOG_COLLECTION_ID,
          [Query.equal("userId", user.$id), Query.orderDesc("$createdAt")]
        );

        setLogs(
          documents.map((log: any) => ({
            id: log.$id,
            shares: Number(log.shares),
            amount: Number(log.amount),
            pricePerShare: Number(log.pricePerShare),
            status: log.status || "successful",
            date: log.$createdAt,
          }))
        );
      } catch (err) {
        console.error("Error fetching stock logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "pending") return <Badge color="info" size="sm">Pending</Badge>;
    if (status === "successful") return <Badge color="success" size="sm">Successful</Badge>;
    return <Badge color="error" size="sm">{status}</Badge>;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[850px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Shares
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Price per Share
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Total Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((__, j) => (
                      <TableCell key={j} className="px-5 py-4">
                        <Skeleton className="h-4 w-full max-w-[100px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No stock purchase history found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                      {log.shares}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      ${log.pricePerShare.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      ${log.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.date).toLocaleDateString()}
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

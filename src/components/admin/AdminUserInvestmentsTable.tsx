"use client";

import { useEffect, useState } from "react"; 
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { databases, DB_ID, INVESTMENT_COLLECTION } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { plan } from "@/lib/data/info";
import Loading from "../ui/Loading";

interface Props {
    userId: string;
}

interface Investment {
    id: string;
    amount: number;
    plan_id: number;
    start_date: string;
    status: string;
    profit: number | null;
    ends_date: string | null;
    plan_name: string;
}

export default function AdminUserInvestmentsTable({ userId }: Props) {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvestments = async () => {
            setLoading(true);

            try {
                // 1️⃣ Get user's investments
                const res = await databases.listDocuments(
                    DB_ID,
                    INVESTMENT_COLLECTION,
                    [
                        Query.equal("userId", userId),
                        // Query.orderDesc("startDate")
                    ]
                );

                const investments = res.documents ?? [];

                // 2️⃣ Get all plans

                const plansMap = new Map(
                    plan.map((plan) => [plan.id, plan.name])
                );

                // 3️⃣ Format data
                const formatted = investments.map((inv) => {
                    const today = new Date();
                    const endDate = inv.end_date ? new Date(inv.end_date) : null;

                    // If end date is set and it's today or earlier, mark as completed
                    let computedStatus = inv.status;
                    if (endDate && endDate <= today) {
                        computedStatus = "completed";
                    } else if (!endDate || endDate > today) {
                        computedStatus = "active";
                    }

                    return {
                        id: inv.$id,
                        amount: inv.amount,
                        plan_id: inv.planId,
                        start_date: inv.startDate,
                        status: computedStatus,
                        profit: inv.profit,
                        ends_date: inv.endsDate ?? inv.endDate ?? null,
                        plan_name: plansMap.get(inv.planId) ?? "N/A"
                    }

                });


                setInvestments(formatted);
            } catch (err) {
                console.error("Error fetching investments:", err);
                toast.error("Failed to fetch investments");
            } finally {
                setLoading(false);
            }
        };
        fetchInvestments();
    }, [userId]);

    if (loading) return <Loading/>;
    if (investments.length === 0) return <div className="p-6 text-center text-gray-500">No investments found.</div>;

    return (
        <div className="p-5">
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[900px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="text-theme-xs font-medium text-gray-500 px-5 py-3 dark:text-gray-400">Plan</TableCell>
                                    <TableCell isHeader className="text-theme-xs font-medium text-gray-500 px-5 py-3 dark:text-gray-400">Amount</TableCell>
                                    <TableCell isHeader className="text-theme-xs font-medium text-gray-500 px-5 py-3 dark:text-gray-400">Status</TableCell>
                                    <TableCell isHeader className="text-theme-xs font-medium text-gray-500 px-5 py-3 dark:text-gray-400">Started</TableCell>
                                    <TableCell isHeader className="text-theme-xs font-medium text-gray-500 px-5 py-3 dark:text-gray-400">Ends</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {investments.map((inv) => (
                                    <TableRow key={inv.id} className="text-center">
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-800 dark:text-white/90">{inv.plan_name}</TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-white/80">${inv.amount.toFixed(2)}</TableCell>

                                        <TableCell className="px-5 py-3 text-theme-sm">
                                            <Badge
                                                size="sm"
                                                color={
                                                    inv.status === "active"
                                                        ? "success"
                                                        : inv.status === "completed"
                                                            ? "primary"
                                                            : "warning"
                                                }
                                            >
                                                {inv.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {new Date(inv.start_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {inv.ends_date ? new Date(inv.ends_date).toLocaleDateString() : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

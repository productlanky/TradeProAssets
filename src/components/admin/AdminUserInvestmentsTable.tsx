"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

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
            const { data, error } = await supabase
                .from("user_investments")
                .select("*, investment_plans(name)")
                .eq("user_id", userId)
                .order("start_date", { ascending: false });

            if (error) {
                console.error(error);
                toast.error("Failed to fetch investments");
                return;
            }

            const formatted = data.map((inv) => ({
                id: inv.id,
                amount: inv.amount,
                plan_id: inv.plan_id,
                start_date: inv.start_date,
                status: inv.status,
                profit: inv.profit,
                ends_date: inv.end_date,
                plan_name: inv.investment_plans?.name ?? "N/A",
            }));

            setInvestments(formatted);
            setLoading(false);
        };

        fetchInvestments();
    }, [userId]);

    if (loading) return <div className="p-6 text-center">Loading investments...</div>;
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

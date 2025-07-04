"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Select from "@/components/form/Select";
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

const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
];

export default function AdminUserTransactionsTable({ userId }: Props) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                toast.error("Failed to fetch transactions");
                return;
            }

            setTransactions(data || []);
            setLoading(false);
        };

        fetchTransactions();
    }, [userId]);

    const handleStatusChange = async (id: number, newStatus: string) => {
        const tx = transactions.find((t) => t.id === id);
        if (!tx) return;

        const { amount, type, status: oldStatus } = tx;

        // Update transaction status
        const { error: updateError } = await supabase
            .from("transactions")
            .update({ status: newStatus })
            .eq("id", id);

        if (updateError) {
            toast.error("Failed to update status");
            return;
        }

        // Prepare notification message
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        const message = `${capitalizedType} of $${amount} was ${newStatus}`;

        // Send notification
        const { error: notifError } = await supabase.from("notifications").insert([
            {
                user_id: userId,
                title: "Transaction Status Updated",
                message,
                type: "transaction",
                read: false,
            },
        ]);

        if (notifError) {
            toast.warning("Status updated, but notification failed.");
        }

        // Handle balance logic
        const { data: userProfile, error: profileError } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", userId)
            .single();

        if (profileError) {
            toast.warning("Updated, but failed to load balance");
        } else {
            let newBalance = userProfile.balance;

            const wasApproved = oldStatus === "approved";
            const willBeApproved = newStatus === "approved";

            // Apply balance changes only if status change involves approval
            if (!wasApproved && willBeApproved) {
                newBalance += type === "deposit" ? amount : -amount;
            } else if (wasApproved && !willBeApproved) {
                newBalance += type === "deposit" ? -amount : amount;
            }

            // Update balance if it changed
            const { error: balanceError } = await supabase
                .from("profiles")
                .update({ balance: newBalance })
                .eq("id", userId);

            if (balanceError) {
                toast.warning("Status changed, but failed to update balance.");
            }
        }

        // Update local state
        setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );

        toast.success("Transaction status and balance updated");
    };


    if (loading) return <div className="p-6 text-center">Loading transactions...</div>;

    if (!transactions.length)
        return <div className="p-6 text-gray-500 text-center">No transactions found.</div>;

    return (
        <div className="p-5">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1024px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400">
                                        ID
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400">
                                        Amount
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400">
                                        Method
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400">
                                        Status
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400">
                                        Created At
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="px-5 py-4 text-start">{tx.id}</TableCell>
                                        <TableCell className="px-5 py-4 text-start">${tx.amount.toLocaleString()}</TableCell>
                                        <TableCell className="px-5 py-4 text-start">{tx.type}</TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            <div className="flex items-center gap-2">
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
                                                <Select
                                                    options={statusOptions}
                                                    value={tx.status}
                                                    onValueChange={(val) => handleStatusChange(tx.id, val)}
                                                    className="min-w-[120px]"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">
                                            {new Date(tx.created_at).toLocaleString()}
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

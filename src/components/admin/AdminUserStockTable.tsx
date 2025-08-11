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
import { databases, DB_ID, STOCKLOG_COLLECTION_ID } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import Loading from "../ui/Loading";
import { RiStockFill } from "react-icons/ri";
import { Skeleton } from "../ui/skeleton";
import { fetchTeslaPrice } from "@/app/(admin)/(others-pages)/shares/page";

interface Props {
    userId: string;
}

type Transaction = {
    id: string;
    user_id: string;
    amount: number;
    shares: number;
    price: number;
    created_at: string;
};

export default function AdminUserStockTable({ userId }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalShares, setTotalShare] = useState<number | null>(null);
    const [sharePrice, setSharePrice] = useState(0);

    useEffect(() => {
        fetchTeslaPrice().then(price => {
            setSharePrice(parseFloat(price));
            console.log("Tesla Stock Price:", price);
        });


        const fetchTransactions = async () => {
            try {
                setLoading(true);

                const res = await databases.listDocuments(
                    DB_ID,
                    STOCKLOG_COLLECTION_ID,
                    [
                        Query.equal("userId", userId),
                        Query.orderDesc("$createdAt")
                    ]
                );

                setTransactions(
                    (res.documents || []).map((doc) => ({
                        id: doc.$id,
                        user_id: doc.user_id ?? doc.userId,
                        amount: doc.amount,
                        shares: doc.shares,
                        price: doc.price,
                        created_at: doc.created_at ?? doc.$createdAt,
                    }))
                );

                const totalShare = res.documents.reduce((sum, tx) => sum + (tx.shares || 0), 0) || 0;
                setTotalShare(totalShare)
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
                toast.error("Failed to fetch transactions");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [userId]);



    if (loading) return <Loading />;

    if (!transactions.length)
        return <div className="p-6 text-gray-500 text-center">No transactions found.</div>;

    return (
        <div className="p-5">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1024px] space-y-4">
                        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 dark:bg-white/[0.03] md:p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                                <RiStockFill size={20} className="text-gray-800 dark:text-white/90" />
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Total Shares</span>
                                <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                                    {loading ? <Skeleton className="h-6 w-24" /> : `$${((totalShares || 0) * sharePrice)?.toFixed(2)}`}
                                </h4>
                            </div>
                        </div>

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
                                        Shares
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400">
                                        Price
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
                                        <TableCell className="px-5 py-4 text-start">{tx.shares}</TableCell>
                                        <TableCell className="px-5 py-4 text-start">{tx.price}</TableCell>
                                        {/* <TableCell className="px-5 py-4 text-start">
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
                                        </TableCell> */}
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

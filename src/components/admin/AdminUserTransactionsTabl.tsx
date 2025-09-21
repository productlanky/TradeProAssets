"use client";

import { useEffect, useState } from "react";
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
import { databases, DB_ID, NOTIFICATION_COLLECTION, PROFILE_COLLECTION_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { ID, Query } from "appwrite";
import Loading from "../ui/Loading";
import Link from "next/link";

interface Props {
    userId: string;
}

type Transaction = {
    id: string;
    user_id: string;
    amount: number;
    type: "deposit" | "withdrawal" | 'welcome bonus';
    status: "pending" | "approved" | "rejected";
    created_at: string;
    method: string;
    photo?: string;
};


const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
];

export default function AdminUserTransactionsTable({ userId }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);

                const res = await databases.listDocuments(
                    DB_ID,
                    TRANSACTION_COLLECTION,
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
                        type: doc.type,
                        method: doc.method,
                        status: doc.status,
                        created_at: doc.created_at ?? doc.$createdAt,
                        photo: doc.photoUrl
                    }))
                );
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
                toast.error("Failed to fetch transactions");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [userId]);


    // const handleStatusChange = async (id: string, newStatus: string) => {
    //     const tx = transactions.find((t) => String(t.id) === id);
    //     if (!tx) return;

    //     const { amount, type, status: oldStatus } = tx;

    //     try {
    //         // ✅ Update transaction status
    //         await databases.updateDocument(
    //             DB_ID,
    //             TRANSACTION_COLLECTION,
    //             id,
    //             { status: newStatus }
    //         );

    //         // ✅ Prepare notification message
    //         const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    //         const message = `${capitalizedType} of $${amount} was ${newStatus}`;

    //         // ✅ Send notification
    //         await databases.createDocument(
    //             DB_ID,
    //             NOTIFICATION_COLLECTION,
    //             ID.unique(),
    //             {
    //                 userId: userId,
    //                 title: "Transaction Status Updated",
    //                 message,
    //                 type: "transaction",
    //                 read: false,
    //             }
    //         );

    //         // ✅ Get current balance
    //         const profileRes = await databases.listDocuments(
    //             DB_ID,
    //             PROFILE_COLLECTION_ID,
    //             [Query.equal("userId", userId)]
    //         );

    //         const profileDoc = profileRes.documents[0];
    //         let newBalance = profileDoc?.totalDeposit ?? 0;
    //         let newBalanc = profileDoc?.balance ?? 0;
    //         let newAmount = profileDoc?.balance ?? 0;

    //         const wasApproved = oldStatus === "approved";
    //         const willBeApproved = newStatus === "approved";

    //         // ✅ Adjust balance only when approval status changes
    //         if (!wasApproved && willBeApproved) {
    //             newBalance += type === "deposit" ? amount : -amount;
    //             newBalanc += type === "deposit" ? amount : -amount;
    //             newAmount += type === "withdrawal" ? -amount : amount;
    //         } else if (wasApproved && !willBeApproved) {
    //             newBalance += type === "deposit" ? -amount : amount;
    //             newBalanc += type === "deposit" ? -amount : amount;
    //             newAmount += type === "withdrawal" ? amount : -amount;
    //         }
    //         // ✅ Update profile balance if changed
    //         if (profileDoc && type === 'deposit') {
    //             await databases.updateDocument(
    //                 DB_ID,
    //                 PROFILE_COLLECTION_ID,
    //                 profileDoc.$id,
    //                 {
    //                     totalDeposit: newBalance,
    //                     balance: newBalanc
    //                 }
    //             );
    //         } else {
    //             await databases.updateDocument(
    //                 DB_ID,
    //                 PROFILE_COLLECTION_ID,
    //                 profileDoc.$id,
    //                 {
    //                     balance: newAmount
    //                 }
    //             );
    //         }


    //         // ✅ Update local state
    //         setTransactions((prev) =>
    //             prev.map((t) =>
    //                 String(t.id) === id ? { ...t, status: newStatus as Transaction["status"] } : t
    //             )
    //         );

    //         toast.success("Transaction status and balance updated");
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Failed to update status");
    //     }
    // };

const handleStatusChange = async (id: string, newStatus: string) => {
    const tx = transactions.find((t) => String(t.id) === id);
    if (!tx) return;

    const { amount, type, status: oldStatus } = tx;

    try {
        // ✅ Update transaction status
        await databases.updateDocument(
            DB_ID,
            TRANSACTION_COLLECTION,
            id,
            { status: newStatus }
        );

        // ✅ Prepare notification message
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        const message = `${capitalizedType} of $${amount} was ${newStatus}`;

        // ✅ Send notification
        await databases.createDocument(
            DB_ID,
            NOTIFICATION_COLLECTION,
            ID.unique(),
            {
                userId,
                title: "Transaction Status Updated",
                message,
                type: "transaction",
                read: false,
            }
        );

        // ✅ Get current profile
        const profileRes = await databases.listDocuments(
            DB_ID,
            PROFILE_COLLECTION_ID,
            [Query.equal("userId", userId)]
        );
        const profileDoc = profileRes.documents[0];
        if (!profileDoc) throw new Error("Profile not found");

        let newBalance = profileDoc.balance ?? 0;
        let newTotalDeposit = profileDoc.totalDeposit ?? 0;

        const wasApproved = oldStatus === "approved";
        const willBeApproved = newStatus === "approved";
        const willBeRejected = newStatus === "rejected";

        // ✅ Balance logic
        if (!wasApproved && willBeApproved) {
            // Approve transaction
            if (type === "deposit") {
                newBalance += amount;
                newTotalDeposit += amount;
            } else if (type === "withdrawal") {
                newBalance -= amount;
            }
        } else if (wasApproved && !willBeApproved) {
            // Undo approval
            if (type === "deposit") {
                newBalance -= amount;
                newTotalDeposit -= amount;
            } else if (type === "withdrawal") {
                newBalance += amount;
            }
        } else if (willBeRejected) {
            // Refund rejected withdrawals
            if (type === "withdrawal") {
                newBalance += amount;
            }
            // (Optional) If you also want to "remove" rejected deposits, uncomment:
            // if (type === "deposit") {
            //     newBalance -= amount;
            //     newTotalDeposit -= amount;
            // }
        }

        // ✅ Update profile
        await databases.updateDocument(DB_ID, PROFILE_COLLECTION_ID, profileDoc.$id, {
            balance: newBalance,
            totalDeposit: newTotalDeposit,
        });

        // ✅ Update local state
        setTransactions((prev) =>
            prev.map((t) =>
                String(t.id) === id ? { ...t, status: newStatus as Transaction["status"] } : t
            )
        );

        toast.success("Transaction status and balance updated");
    } catch (error) {
        console.error(error);
        toast.error("Failed to update status");
    }
};


    if (loading) return <Loading />;

    if (!transactions.length)
        return <div className="p-6 text-gray-500 text-center">No transactions found.</div>;

    return (
        <div className="p-5">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1024px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] uppercase">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium dark:text-gray-400">
                                        Type (click to see receipt)
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
                                        <TableCell className="px-5 py-4 uppercase text-start">
                                            {
                                                tx.photo ?
                                                    <Link className="text-green-500" target="_blank" href={tx.photo}>{tx.type}</Link>
                                                    : tx.type
                                            }
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-start">${tx.amount.toLocaleString()}</TableCell>
                                        <TableCell className="px-5 py-4 text-start uppercase">{tx.method}</TableCell>
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

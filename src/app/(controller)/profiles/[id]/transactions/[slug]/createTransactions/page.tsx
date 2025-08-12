"use client";

import React, { use, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { toast } from "sonner";
import { databases, DB_ID, NOTIFICATION_COLLECTION, PROFILE_COLLECTION_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { ID, Query } from "appwrite";
import Select from "@/components/form/Select";
import { useRouter } from "next/navigation";

const METHODS = [
  { value: "bitcoin", label: "Bitcoin" },
  { value: "bank", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
];

const TYPES = [
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function CreateTransactionPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState(slug);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!userId || !amount || !method || !type || !status) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsSaving(true);

      await databases.createDocument(DB_ID, TRANSACTION_COLLECTION, ID.unique(), {
        userId,
        amount: parseFloat(amount),
        method,
        type,
        status,
      });

      // Create notification
      let message = "";
      if (type === "deposit") {
        if (status === "pending") message = `Your deposit of $${amount} is pending.`;
        if (status === "approved") message = `Your deposit of $${amount} has been approved.`;
        if (status === "rejected") message = `Your deposit of $${amount} was rejected.`;
      } else if (type === "withdrawal") {
        if (status === "pending") message = `Your withdrawal of $${amount} is pending.`;
        if (status === "approved") message = `Your withdrawal of $${amount} has been approved.`;
        if (status === "rejected") message = `Your withdrawal of $${amount} was rejected.`;
      }

      await databases.createDocument(DB_ID, NOTIFICATION_COLLECTION, ID.unique(), {
        userId,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${status}`,
        message,
        type
      });

      // Update user balance only if approved
      if (status === "approved") {
        const profileRes = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("userId", userId)]
        );

        const userDoc = profileRes.documents[0];
        let currentBalance = userDoc.balance || 0;
        let currentDeposit = userDoc.totalDeposit || 0;
        let newBalance =
          type === "deposit"
            ? currentBalance + parseFloat(amount)
            : currentBalance - parseFloat(amount);
        let newDeposit =
          type === "deposit"
            ? currentDeposit + parseFloat(amount)
            : currentDeposit - parseFloat(amount);


        await databases.updateDocument(DB_ID, PROFILE_COLLECTION_ID, id, {
          balance: newBalance,
          totalDeposit: newDeposit,
        });
      }

      setAmount("");
      setMethod("");
      setType("");
      setStatus("");
      toast.success("Transaction created and notification sent");

      router.push(`/profiles/${id}/transactions/${slug}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create transaction");
    } finally {
      setAmount("");
      setMethod("");
      setType("");
      setStatus("");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl shadow-md space-y-6 bg-white dark:bg-white/[0.03]">
      <h2 className="text-xl font-bold">Create Transaction (Admin)</h2>

      {/* User ID */}
      <Input
        placeholder="Enter User ID"
        value={slug}
        readonly
        defaultValue={slug}
        onChange={(e) => setUserId(e.target.value)}
      />

      {/* Amount */}
      <Input
        type="number"
        value={amount}
        placeholder="Enter Amount"
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Payment Method */}
      <div>
        <p className="mb-2">Payment Method:</p>
        <Select
          value={method}
          onValueChange={(value) => setMethod(value)}
          className="w-full p-2 border rounded"
          options={METHODS.map((m) => ({ value: m.value, label: m.label }))}
        />

      </div>

      {/* Transaction Type */}
      <div>
        <p className="mb-2">Transaction Type:</p>
        <Select
          value={type}
          onValueChange={(value) => setType(value)}
          className="w-full p-2 border rounded"
          options={TYPES.map((t) => ({ value: t.value, label: t.label }))}
        />
      </div>

      {/* Status */}
      <div>
        <p className="mb-2">Status:</p>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value)}
          className="w-full p-2 border rounded"
          options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>

      {/* Submit */}
      <Button onClick={handleCreate} className="w-full" disabled={isSaving}>
        {isSaving ? "Saving..." : "Create Transaction"}
      </Button>
    </div>
  );
}

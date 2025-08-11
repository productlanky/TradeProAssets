"use client";

import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/ui/button/Button";
import { toast } from "sonner";
import Input from "../form/input/InputField";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, RECEIPTS_BUCKET, storage, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import Radio from "../form/input/Radio";

type StepType = "form" | "method" | "countdown";

const METHODS = [
  { value: "bitcoin", label: "Bitcoin" },
  { value: "bank", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
];

const DepositPage = () => {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<StepType>("form");
  const [countdown, setCountdown] = useState(1800); // 30 min in seconds
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const router = useRouter();

  const bitcoinAddress = process.env.NEXT_PUBLIC_BITCOIN_ADDRESS;

  console.log(receiptFile)

  // Countdown effect
  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, countdown]);

  const handleStartDeposit = () => {
    if (!amount || parseFloat(amount) < 100) {
      toast.error("Minimum deposit is $100");
      return;
    }
    setStep("method");
  };

  const confirmMethod = async () => {
    try {
      if (!paymentMethod) {
        toast.error("Select a payment method.");
        return;
      }

      const user = await getUser();

      // Create deposit record
      const transaction = await databases.createDocument(
        DB_ID,
        TRANSACTION_COLLECTION,
        ID.unique(),
        {
          userId: user.$id,
          type: "deposit",
          amount: parseFloat(amount),
          status: "pending",
          method: paymentMethod,
        }
      );

      setTransactionId(transaction.$id);
      setStep("countdown");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start deposit.");
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const user = await getUser();
      if (!file || !transactionId || !user) return;

      setIsUploading(true);

      const uploadedFile = await storage.createFile(
        RECEIPTS_BUCKET,
        `receipt-${transactionId}`,
        file
      );

      const publicUrl = storage.getFileView(RECEIPTS_BUCKET, uploadedFile.$id);

      await databases.updateDocument(DB_ID, TRANSACTION_COLLECTION, transactionId, {
        photoUrl: publicUrl,
      });

      toast.success("Receipt uploaded successfully!");
      router.push("/transactions");
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("Error uploading receipt.");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setReceiptFile(acceptedFiles[0]);
        handleUpload(acceptedFiles[0]);
      }
    },
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const copyBitcoinAddress = () => {
    if (bitcoinAddress) {
      navigator.clipboard.writeText(bitcoinAddress);
      toast.success("Bitcoin address copied!");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl shadow-md space-y-6 bg-white dark:bg-white/[0.03]">
      <h2 className="text-xl font-bold">Deposit Funds</h2>

      {/* Step 1: Enter Amount */}
      {step === "form" && (
        <>
          <Input
            type="number"
            placeholder="Enter amount (min $100)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <Button onClick={handleStartDeposit} className="w-full mt-3">
            Next
          </Button>
        </>
      )}

      {/* Step 2: Select Payment Method */}
      {step === "method" && (
        <>
          <p className="mb-2">Select Payment Method:</p>
          <div className="space-y-2">
            {METHODS.map((m) => (
              <label
                key={m.value}
                className={`block p-3 border rounded cursor-pointer ${
                  paymentMethod === m.value ? "border-brand-500" : "border-gray-300"
                }`}
              >
                <Radio
                  id={`method-${m.value}`}
                  label={m.label}
                  name="method"
                  value={m.value}
                  checked={paymentMethod === m.value}
                  onChange={(value: string) => setPaymentMethod(value)}
                  className="mr-2"
                />
              </label>
            ))}
          </div>
          <Button onClick={confirmMethod} className="w-full mt-4">
            Continue
          </Button>
        </>
      )}

      {/* Step 3: Show based on method */}
      {step === "countdown" && (
        <>
          {paymentMethod === "bitcoin" && (
            <div>
              <p className="text-sm mb-2 text-gray-600">
                Send exactly <strong>${amount}</strong> worth of Bitcoin to:
              </p>
              <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-4 rounded break-all font-mono text-sm">
                {bitcoinAddress}
                <Copy
                  className="ml-2 w-4 h-4 cursor-pointer text-gray-500 hover:text-black"
                  onClick={copyBitcoinAddress}
                />
              </div>
              <p className="mt-3 text-gray-600 font-semibold">
                You have {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")} minutes
              </p>
            </div>
          )}

          {/* Upload Section (common for all methods) */}
          <div
            {...getRootProps()}
            className="mt-5 transition border border-dashed cursor-pointer rounded-xl hover:border-brand-500 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 p-7 lg:p-10"
          >
            <Input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <div className="mb-5 flex justify-center">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <svg width="29" height="28" viewBox="0 0 29 28">
                    <path
                      fill="currentColor"
                      d="M14.5 3.917a.75.75 0 00-.547.239L8.574 9.532a.75.75 0 001.06 1.06l4.117-4.116v12.19a.75.75 0 001.5 0V6.476l4.113 4.116a.75.75 0 001.06-1.06l-5.341-5.338a.75.75 0 00-.583-.277zM5.917 18.667a.75.75 0 10-1.5 0v3.167A2.25 2.25 0 006.667 24.084h15.667a2.25 2.25 0 002.25-2.25v-3.167a.75.75 0 10-1.5 0v3.167a.75.75 0 01-.75.75H6.667a.75.75 0 01-.75-.75v-3.167z"
                    />
                  </svg>
                </div>
              </div>
              <h4 className="mb-3 font-semibold text-gray-800 text-lg dark:text-white/90">
                {isDragActive ? "Drop Receipt Here" : "Upload Payment Receipt"}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Drop a PNG, JPG, WebP, or SVG image here, or click to browse.
              </p>
            </div>
          </div>

          {isUploading && <p className="text-sm text-blue-600">Uploading...</p>}
        </>
      )}
    </div>
  );
};

export default DepositPage;

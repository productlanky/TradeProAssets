"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useDropzone } from "react-dropzone";
import Button from "@/components/ui/button/Button";
import { toast } from "sonner";
import Input from "../form/input/InputField";

const DepositPage = () => {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<'form' | 'countdown'>('form');
  const [countdown, setCountdown] = useState(1800); // 15 min in seconds
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const bitcoinAddress = "bc1qxyz1234567890youraddress";
  console.log(receiptFile)
  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const interval = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, countdown]);

  const handleStartDeposit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!amount || parseFloat(amount) < 100) {
      toast.error("Minimum deposit is $100");
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user?.id,
        type: "deposit",
        amount: parseFloat(amount),
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.log(error);
      toast.error("Failed to start deposit.");
      return;
    }

    setTransactionId(data.id);
    setStep("countdown");
  };

  const handleUpload = async (file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!file || !transactionId || !user) return;

    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `receipts/${user.id}/${transactionId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Error uploading receipt.");
      console.log(uploadError);
      setIsUploading(false);
      return;
    }

    const publicUrl = supabase.storage.from("receipts").getPublicUrl(filePath).data.publicUrl;

    const { error: updateError } = await supabase
      .from("transactions")
      .update({ photo_url: publicUrl })
      .eq("id", transactionId);

    setIsUploading(false);

    if (updateError) {
      toast.error("Error saving receipt URL.");
      console.log(updateError);
    } else {
      toast.success("Receipt uploaded successfully!");
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

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-xl shadow-md space-y-6 bg-white dark:bg-white/[0.03]">
      <h2 className="text-xl font-bold">Deposit Funds</h2>

      {step === "form" && (
        <>
          <Input
            type="number"
            placeholder="Enter amount (min $100)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <Button onClick={handleStartDeposit} className="w-full mt-3">
            Deposit
          </Button>
        </>
      )}

      {step === "countdown" && (
        <>
          <div>
            <p className="text-sm mb-2 text-gray-600">
              Send exactly <strong>${amount}</strong> worth of Bitcoin to:
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded break-all font-mono text-sm">
              {bitcoinAddress}
            </div>
            <p className="mt-3 text-gray-600 font-semibold">
              You have {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")} minutes
            </p>
          </div>

          <div className="transition border border-dashed cursor-pointer rounded-xl hover:border-brand-500 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 p-7 lg:p-10">
            <form {...getRootProps()} className="text-center">
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
            </form>
          </div>

          {isUploading && <p className="text-sm text-blue-600">Uploading...</p>}
        </>
      )}
    </div>
  );
};

export default DepositPage;

"use client";

import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, PROFILE_COLLECTION_ID, STOCKLOG_COLLECTION_ID} from "@/lib/appwrite/client";
import { ID, Query } from "appwrite";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { fetchTeslaPrice } from "@/lib/appwrite/auth";

export default function BuySharesPage() {

    const [sharePrice, setSharePrice] = useState(0);
    const [quantity, setQuantity] = useState<number | "">("");
    const [amount, setAmount] = useState<number | "">("");
    const [mode, setMode] = useState<"shares" | "amount">("shares");
    const [balance, setBalance] = useState<number>(0);
    const [balanc, setBalanc] = useState<number>(0);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [documentId, setDocumentId] = useState('')

    // Fetch user balance on mount
    const fetchBalance = async () => {
        try {
            const user = await getUser();
            const res = await databases.listDocuments(DB_ID, PROFILE_COLLECTION_ID, [
                Query.equal("userId", user.$id),
            ]);

            if (res.total > 0) {
                setBalance(res.documents[0].totalDeposit || 0);
                setBalanc(res.documents[0].balance || 0);
            }

            setDocumentId(res.documents[0].$id)
        } catch (err) {
            console.error("Error fetching balance:", err);
        }
    };

    useEffect(() => {

        fetchTeslaPrice().then(price => {
            setSharePrice(parseFloat(price));
            console.log("Tesla Stock Price:", price);
        });

        fetchBalance();
    }, []);

    const handleSharesChange = (val: string) => {
        const shares = parseFloat(val);
        if (!isNaN(shares) && shares >= 0) {
            const total = parseFloat((shares * sharePrice).toFixed(2));
            setQuantity(shares);
            setAmount(total);
            validateBalance(total);
        } else {
            setQuantity("");
            setAmount("");
            setError("");
        }
    };

    const handleAmountChange = (val: string) => {
        const dollars = parseFloat(val);
        if (!isNaN(dollars) && dollars >= 0) {
            const shares = parseFloat((dollars / sharePrice).toFixed(4));
            setAmount(dollars);
            setQuantity(shares);
            validateBalance(dollars);
        } else {
            setAmount("");
            setQuantity("");
            setError("");
        }
    };

    const validateBalance = (total: number) => {
        if (total > balance) {
            setError("Insufficient balance to complete this purchase.");
        } else {
            setError("");
        }
    };

    const shootConfetti = () => {
        const end = Date.now() + 1 * 1000;

        const frame = () => {
            confetti({
                particleCount: 5,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: Math.random(), y: Math.random() - 0.2 }
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    };

    const handleBuy = async () => {
        if (!quantity || !amount || amount > balance) {
            return;
        }

        try {
            setIsLoading(true);
            const user = await getUser();

            // Create stock purchase log
            await databases.createDocument(DB_ID, STOCKLOG_COLLECTION_ID, ID.unique(), {
                userId: user.$id,
                shares: quantity,
                amount: amount,
                pricePerShare: sharePrice,
            });

            // Deduct balance locally & in database
            const newBalance = balance - Number(amount);
            const newBalanc = balanc - Number(amount);
            await databases.updateDocument(DB_ID, PROFILE_COLLECTION_ID, documentId, {
                totalDeposit: newBalance,
                balance: newBalanc,
            });

            setBalance(newBalance); // Update UI instantly
            toast(`Successfully purchased ${quantity} shares for $${amount}`);

            // 🎉 Trigger confetti
            shootConfetti();

            // Reset form
            setQuantity("");
            setAmount("");
            setError("");
        } catch (err) {
            console.error("Error creating stock log:", err);
            toast.error("Failed to complete transaction.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center p-6">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-red-500 mb-4"></div>
                        <p className="text-gray-700 dark:text-gray-200 font-medium">Processing your transaction...</p>
                    </div>
                </div>
            )}

            <div className="w-full max-w-lg rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Buy Shares
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Invest in your future today. You can enter either the number of shares or the total amount in dollars.
                </p>

                {/* Price Info */}
                <div className="menu-item-active p-4 rounded-lg flex items-center justify-between mb-6">
                    <span className="font-medium menu-item-icon-active">Current Share Price</span>
                    <span className="text-lg font-bold menu-item-icon-active">${sharePrice.toFixed(2)}</span>
                </div>

                {/* Balance Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between mb-6">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Total Deposit</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${balance.toFixed(2)}</span>
                </div>

                {/* Toggle Mode */}
                <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                        onClick={() => setMode("shares")}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition py-3 ${mode === "shares"
                            ? "bg-[#ce1632] text-white"
                            : "bg-transparent text-gray-600 dark:text-gray-300"
                            }`}
                    >
                        By Shares
                    </button>
                    <button
                        onClick={() => setMode("amount")}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition py-3 ${mode === "amount"
                            ? "bg-[#ce1632] text-white"
                            : "bg-transparent text-gray-600 dark:text-gray-300"
                            }`}
                    >
                        By Amount
                    </button>
                </div>

                {/* Shares Input */}
                {mode === "shares" && (
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                            Number of Shares
                        </label>
                        <Input
                            type="number"
                            min="0"
                            step={0.0001}
                            value={quantity}
                            onChange={(e) => handleSharesChange(e.target.value)}
                            className="w-full px-4 py-2"
                        />
                    </div>
                )}

                {/* Amount Input */}
                {mode === "amount" && (
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                            Amount in Dollars
                        </label>
                        <Input
                            type="number"
                            min="0"
                            step={0.01}
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-full px-4 py-2"
                        />
                    </div>
                )}

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex flex-col gap-2 mb-4">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Shares</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {quantity || 0}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Total Cost</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${amount || 0}
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                {/* Buy Button */}
                <Button
                    onClick={handleBuy}
                    disabled={!quantity || !amount || !!error || isLoading}
                    className="w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Buy Now
                </Button>

                {/* Info */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Transactions are processed securely and instantly.
                </p>
            </div>
        </div>
    );
}

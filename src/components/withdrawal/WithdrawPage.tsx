"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { validate as validateBitcoin } from "bitcoin-address-validation";
import WithdrawAlert from "./WithdrawAlert";
import WithdrawForm from "./WithdrawForm";

type WithdrawalForm = {
    amount: number;
    crypto: string;
    address: string;
    password: string;
};

type Tier = {
    level: string;
    min_referrals: number;
    deposit_required: number;
};

type Profile = {
    id: string;
    balance: number;
    withdrawal_password?: string;
    tiers?: Tier[];
};

export default function WithdrawPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [kycStatus, setKycStatus] = useState("pending");
    const [maxWithdrawAmount, setMaxWithdrawAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const {
        reset,
    } = useForm<WithdrawalForm>({
        defaultValues: {
            crypto: "BTC",
        },
    });

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("id, balance, withdrawal_password, tiers (*)")
                .eq("id", user.id)
                .single();

            if (error || !profileData) {
                console.log("Failed to load profile:", error);
                toast.error("Failed to load profile.");
                return;
            }

            setProfile(profileData);
            // Use the first tier's min_referrals if tiers exist, otherwise default to 0
            setMaxWithdrawAmount(profileData.tiers && profileData.tiers.length > 0 ? profileData.tiers[0].min_referrals * 100 : 50);
            setIsLoading(false);

            const { data: kyc } = await supabase
                .from("kyc_requests")
                .select("status")
                .eq("user_id", user.id)
                .single();

            setKycStatus(kyc?.status || "pending");
        })();
    }, []);

    const validateAddress = (crypto: string, address: string) => {
        if (crypto === "BTC") return validateBitcoin(address);
        if (crypto === "ETH") return /^0x[a-fA-F0-9]{40}$/.test(address);
        return false;
    };

    const onSubmit = async (data: WithdrawalForm) => {
        if (!profile || isLoading) return;

        if (kycStatus !== "approved") {
            toast.error("KYC not approved.");
            return;
        }

        if (!validateAddress(data.crypto, data.address)) {
            toast.error("Invalid crypto address.");
            return;
        }

        if (!profile.withdrawal_password) {
            toast.error("You must set a withdrawal password in your profile.");
            return;
        }

        if (data.password !== profile.withdrawal_password) {
            toast.error("Incorrect withdrawal password.");
            return;
        }

        if (data.amount > profile.balance) {
            toast.error("Insufficient balance.");
            return;
        }

        if (data.amount > maxWithdrawAmount) {
            toast.error(`Limit exceeded. Max allowed: ${maxWithdrawAmount}`);
            return;
        }

        const { error } = await supabase.from("transactions").insert([
            {
                user_id: profile.id,
                type: "withdrawal",
                amount: data.amount,
                photo_url: data.address,
                status: "pending",
            },
        ]);

        if (error) {
            console.log("Withdrawal error:", error);
            toast.error("Withdrawal failed.");
        } else {
            await supabase.from("notifications").insert([
                {
                    user_id: profile.id,
                    title: "Withdrawal Placed",
                    message: "Your withdrawal was submitted successfully and will be processed within 4 working days.",
                    type: "withdrawal",
                },
            ]);
            toast.success("Withdrawal submitted.");
            reset();
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
            <div className="mx-auto p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.03]">
                <WithdrawAlert
                    kycStatus={kycStatus}
                    withdrawalPasswordSet={!!profile?.withdrawal_password}
                />
                <WithdrawForm onSubmit={onSubmit} />
            </div>
        </div>
    );
}

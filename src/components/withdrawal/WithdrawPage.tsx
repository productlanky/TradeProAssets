"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import { validate as validateBitcoin } from "bitcoin-address-validation";
import Alert from "../ui/alert/Alert";
import Select from "../form/Select";
import WithdrawAlert from "./WithdrawAlert";
import WithdrawForm from "./WithdrawForm";

type WithdrawalForm = {
    amount: number;
    crypto: string;
    address: string;
    password: string;
};

const CRYPTO_OPTIONS = [
    { label: "Bitcoin", value: "BTC" },
    { label: "Ethereum", value: "ETH" },
];

export default function WithdrawPage() {
    const [profile, setProfile] = useState<any>(null);
    const [kycStatus, setKycStatus] = useState<string>("pending");
    const [maxWithdrawAmount, setMaxWithdrawAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
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
                .select("*, tiers(*)")
                .eq("id", user.id)
                .single();

            if (error || !profileData) {
                toast.error("Failed to load profile.");
                return;
            }

            setProfile(profileData);
            setMaxWithdrawAmount(profileData.tiers?.min_referrals * 100);
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
        switch (crypto) {
            case "BTC":
                return validateBitcoin(address);
            case "ETH":
                return /^0x[a-fA-F0-9]{40}$/.test(address);
            default:
                return false;
        }
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
                crypto_type: data.crypto,
            },
        ]);

        if (error) {
            toast.error("Withdrawal failed.");
        } else {
            await supabase.from("notifications").insert([
                {
                    user_id: profile.id,
                    title: "Withdrawal Placed",
                    message:
                        "Your withdrawal was submitted successfully and will be processed within 4 working days.",
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
                <WithdrawForm onSubmit={handleSubmit(onSubmit)} />
            </div>
        </div>

    );
}

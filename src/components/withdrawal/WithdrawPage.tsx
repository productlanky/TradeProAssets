"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { validate as validateBitcoin } from "bitcoin-address-validation";
import WithdrawAlert from "./WithdrawAlert";
import WithdrawForm, { WithdrawFormFields } from "./WithdrawForm";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, NOTIFICATION_COLLECTION, PROFILE_COLLECTION_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { ID, Query } from "appwrite";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";


type Tier = {
    level: string;
    min_referrals: number;
    deposit_required: number;
};

type Profile = {
    id: string;
    profileId: string;
    balance: number;
    withdrawal_password?: string;
    tiers?: Tier[];
    kycStatus?: string; // Added for KYC status
};

export default function WithdrawPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [maxWithdrawAmount, setMaxWithdrawAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const {
        reset,
    } = useForm<WithdrawFormFields>({
        defaultValues: {
            method: "BTC",
        },
    });

    useEffect(() => {
        (async () => {
            try {
                // 1️⃣ Get logged-in user
                const user = await getUser();
                if (!user) return;

                // 2️⃣ Fetch profile (with tier info)
                const profileRes = await databases.listDocuments(
                    DB_ID,
                    PROFILE_COLLECTION_ID,
                    [Query.equal("userId", user.$id)]
                );

                if (!profileRes.documents.length) {
                    toast.error("Failed to load profile.");
                    console.log("Profile not found");
                    return;
                }

                const profileData = profileRes.documents[0];
                const mappedProfile: Profile = {
                    id: user.$id,
                    profileId: profileData.$id,
                    balance: profileData.balance,
                    withdrawal_password: profileData.withdrawalPassword,
                    tiers: profileData.tierLevel,
                    kycStatus: profileData.kycStatus,
                };
                setProfile(mappedProfile);

                console.log("Profile loaded:", mappedProfile);
                setMaxWithdrawAmount(profileData.withdrawalLimit);


                setIsLoading(false);
            } catch (error) {
                console.error("Error loading profile/KYC:", error);
                toast.error("Failed to load profile.");
            }
        })();
    }, []);


    const validateAddress = (crypto: string, address: string) => {
        if (crypto === "BTC") return validateBitcoin(address);
        if (crypto === "ETH") return /^0x[a-fA-F0-9]{40}$/.test(address);
        return false;
    };

    const onSubmit = async (data: WithdrawFormFields) => {
        if (!profile || isLoading) return;

        // ✅ Validation checks
        if (profile.kycStatus !== "approved") {
            toast.error("KYC not approved.");
            return;
        }

        if (data.method === 'BTC' && !data.address || data.method === 'BTC' && !validateAddress(data.method, data.address ? data.address : "")) {
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
            toast.error(`Limit exceeded. Max allowed: $${maxWithdrawAmount}`);
            return;
        }

        try {
            // 1️⃣ Insert withdrawal transaction
            await databases.createDocument(
                DB_ID,
                TRANSACTION_COLLECTION,
                ID.unique(),
                {
                    userId: profile.id,
                    type: 'withdrawal',
                    method: data.method,
                    amount: parseFloat(data.amount.toString()),
                    status: "pending",
                }
            );

            // 2️⃣ Insert notification
            await databases.createDocument(
                DB_ID,
                NOTIFICATION_COLLECTION,
                ID.unique(),
                {
                    userId: profile.id,
                    title: "Withdrawal Placed",
                    message:
                        "Your withdrawal was submitted successfully and will be processed within 4 working days.",
                    type: "withdrawal",
                }
            );

            const UserProfileId = profile.profileId;

            // 3️⃣ Update user profile balance
            await databases.updateDocument(
                DB_ID,
                PROFILE_COLLECTION_ID,
                UserProfileId, {
                balance: profile.balance - data.amount,
            });

            toast.success("Withdrawal submitted.");
            router.push('/transactions');
            reset();
        } catch (error) {
            console.error("Withdrawal error:", error);
            toast.error("Withdrawal failed.");
        }
    };


    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
            <div className="mx-auto p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-white/[0.03]">
                {!isLoading ?
                    <>
                        <WithdrawAlert
                            kycStatus={profile?.kycStatus || "pending"}
                            withdrawalPasswordSet={!!profile?.withdrawal_password}
                        />
                        <WithdrawForm onSubmit={onSubmit} />
                    </>
                    :
                    <div className="space-y-4 pb-4">
                        <Skeleton className="h-[140px] w-full rounded-xl" />
                        <Skeleton className="h-[140px] w-full rounded-xl" />
                        <Skeleton className="h-[340px] w-full rounded-xl" />
                    </div>}

            </div>
        </div>
    );
}

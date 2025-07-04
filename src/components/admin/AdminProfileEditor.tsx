"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import KycDocumentCard from "./KycDocumentCard";
import Link from "next/link";

interface Props {
    id: string;
}

const profileFields = [
    "first_name",
    "last_name",
    "email",
    "gender",
    "phone",
    "country",
    "state",
    "city",
    "zip",
    "address",
    "balance",
    "dob",
];

const displayFields = [...profileFields, "created_at", "kyc_status"];

const kycStatusOptions = [
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "In Review", value: "reviewing" },
];

export default function AdminUserProfileCard({ id }: Props) {
    const { isOpen, openModal, closeModal } = useModal();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<any>({});
    const [kycStatus, setKycStatus] = useState<string>('');
    const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null);
    const [backImageUrl, setBackImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .single();

            const { data: kyc, error: kycError } = await supabase
                .from("kyc_requests")
                .select("status, front_image_url, back_image_url")
                .eq("user_id", id)
                .order("submitted_at", { ascending: false }) // Assumes you have created_at
                .limit(1);

            if (profileError) {
                toast.error("Failed to fetch user");
                return;
            }

            if (kyc && kyc.length > 0) {
                setKycStatus(kyc[0].status || ''); // Set initial KYC status
                setFrontImageUrl(kyc[0].front_image_url || null);
                setBackImageUrl(kyc[0].back_image_url || null);

            } else {
                setKycStatus('');
            }
            setProfile({ ...profile });
            setForm({ ...profile });
            setLoading(false);


        };


        fetchUser();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "number" ? (value === "" ? "" : Number(value)) : value;
        setForm((prev: any) => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedFields: Record<string, any> = {};

        for (const key of profileFields) {
            const current = profile[key];
            const edited = form[key];

            const changed =
                current instanceof Date || key === "dob"
                    ? new Date(current).toISOString().split("T")[0] !==
                    new Date(edited).toISOString().split("T")[0]
                    : current !== edited;

            if (changed) updatedFields[key] = edited;
        }

        // Update profiles if any fields changed
        if (Object.keys(updatedFields).length > 0) {
            const { error: profileError } = await supabase
                .from("profiles")
                .update(updatedFields)
                .eq("id", id);

            if (profileError) {
                toast.error("Failed to update user");
                return;
            }
        }

        // Update KYC status if changed
        if (kycStatus !== profile.kyc_requests?.status) {
            const { error: kycError } = await supabase
                .from("kyc_requests")
                .update({ status: kycStatus })
                .eq("user_id", id);

            if (kycError) {
                toast.error("Failed to update KYC status");
                return;
            }
        }

        toast.success("User updated successfully");
        closeModal();

        setProfile((prev: any) => ({
            ...prev,
            ...updatedFields,
            kyc_requests: kycStatus,
        }));
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!profile) return <div className="p-6 text-red-500 text-center">User not found.</div>;

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Profile Details
                        </h4>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            {displayFields.map((field) => (
                                <div key={field}>
                                    <p className="mb-1 text-xs text-gray-500 capitalize dark:text-gray-400">
                                        {field.replace("_", " ")}
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {field === "created_at" || field === "dob"
                                            ? profile[field]
                                                ? new Date(profile[field]).toLocaleDateString()
                                                : "-"
                                            : field === "kyc_status"
                                                ? kycStatus ?? "-"
                                                : profile[field] ?? "-"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={openModal}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                    >
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                            />
                        </svg>
                        Edit
                    </button>


                </div>
            </div>

            <div className="flex flex-wrap mt-6 items-start gap-3 lg:items-end">
                <Link href={`/profiles/${id}/investments`} className="w-full md:w-auto">
                    <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0ZM7.5 12H10.5V10.5H7.5V12ZM7.5 9H10.5V3H7.5V9Z"
                            />
                        </svg>
                        View Investments
                    </button>
                </Link>
                <Link href={`/profiles/${id}/transactions`} className="w-full md:w-auto">
                    <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0ZM7.5 12H10.5V10.5H7.5V12ZM7.5 9H10.5V3H7.5V9Z"
                            />
                        </svg>
                        View Transactions
                    </button>
                </Link>
            </div>

            <KycDocumentCard frontImageUrl={frontImageUrl} backImageUrl={backImageUrl} />


            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Profile
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                            Update user details
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="flex flex-col">
                        <div className="px-2 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                {profileFields.map((field) => (
                                    <div key={field} className={field === "address" ? "lg:col-span-2" : ""}>
                                        <Label>{field.replace("_", " ").toUpperCase()}</Label>
                                        <Input
                                            type={
                                                field === "balance" || field === "zip"
                                                    ? "number"
                                                    : field === "dob"
                                                        ? "date"
                                                        : "text"
                                            }
                                            name={field}
                                            value={form[field] ?? ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ))}

                                <div className="lg:col-span-2">
                                    <Label>KYC STATUS</Label>
                                    <Select
                                        options={kycStatusOptions}
                                        placeholder="Select status"
                                        className="dark:bg-dark-900"
                                        value={kycStatus}
                                        onValueChange={setKycStatus}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button size="sm" type="submit">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}

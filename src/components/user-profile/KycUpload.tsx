"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import Button from "../ui/button/Button";
import Image from "next/image";

type KYCStatus = "pending" | "reviewing" | "approved" | "rejected";

export default function KYCUpload() {
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [frontUrl, setFrontUrl] = useState<string | null>(null);
    const [backUrl, setBackUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [kycStatus, setKycStatus] = useState<KYCStatus>('pending');

    useEffect(() => {
        return () => {
            if (frontUrl) URL.revokeObjectURL(frontUrl);
            if (backUrl) URL.revokeObjectURL(backUrl);
        };
    }, [frontUrl, backUrl]);


    useEffect(() => {
        const fetchKYC = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from("kyc_requests")
                    .select("status")
                    .eq("user_id", user.id)
                    .single();

                if (data?.status) {
                    setKycStatus(data.status as KYCStatus);
                }
            }
        };

        fetchKYC();
    }, []);

    const uploadToStorage = async (file: File, label: "front" | "back") => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            toast.error("Not authenticated.");
            return null;
        }

        const ext = file.name.split(".").pop();
        const path = `${user.id}/${label}_${uuidv4()}.${ext}`;

        const { error } = await supabase.storage.from("kyc-documents").upload(path, file, {
            upsert: true,
        });

        if (error) {
            console.error(error);
            toast.error(`Failed to upload ${label} image.`);
            return null;
        }

        const { data } = supabase.storage.from("kyc-documents").getPublicUrl(path);
        return data.publicUrl;
    };

    const handleSubmit = async () => {
        if (!frontFile || !backFile) {
            toast.error("Please upload both sides of your ID.");
            return;
        }

        if (kycStatus === "reviewing" || kycStatus === "approved") {
            toast.error("Your KYC is already in review or approved.");
            return;
        }

        setUploading(true);

        const frontImageUrl = await uploadToStorage(frontFile, "front");
        const backImageUrl = await uploadToStorage(backFile, "back");

        if (frontImageUrl && backImageUrl) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const { data: existing } = await supabase
                .from("kyc_requests")
                .select("id")
                .eq("user_id", user?.id)
                .single();

            let updateError;

            if (existing) {
                const { error } = await supabase
                    .from("kyc_requests")
                    .update({
                        front_image_url: frontImageUrl,
                        back_image_url: backImageUrl,
                        status: "reviewing",
                        reviewed_at: null,
                    })
                    .eq("user_id", user?.id);

                updateError = error;
            } else {
                const { error } = await supabase.from("kyc_requests").insert({
                    user_id: user?.id,
                    front_image_url: frontImageUrl,
                    back_image_url: backImageUrl,
                    status: "reviewing",
                });

                updateError = error;
            }

            if (updateError) {
                toast.error("Failed to submit KYC.");
                console.log(updateError);
            } else {
                toast.success("KYC submitted successfully.");
                setKycStatus("reviewing");
                setFrontFile(null);
                setBackFile(null);
                setFrontUrl(null);
                setBackUrl(null);
            }
        }

        setUploading(false);
    };

    const DropInput = ({
        label,
        previewUrl,
        onFileSelect,
    }: {
        label: string;
        previewUrl: string | null;
        onFileSelect: (file: File) => void;
    }) => {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            accept: {
                "image/png": [],
                "image/jpeg": [],
                "image/webp": [],
                "image/svg+xml": [],
            },
            maxFiles: 1,
            onDrop: (files) => {
                const file = files[0];
                if (file) {
                    onFileSelect(file);
                }
            },
        });

        return (
            <div>
                <div
                    {...getRootProps()}
                    className={`transition border border-dashed rounded-xl mb-3 p-7 lg:p-10 cursor-pointer ${isDragActive
                        ? "border-blue-500 bg-gray-100 dark:bg-gray-800"
                        : "bg-gray-50 border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                        <div className="mb-4 flex justify-center">
                            <div className="h-[68px] w-[68px] rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                📄
                            </div>
                        </div>
                        <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                            {isDragActive ? "Drop File Here" : `Upload ${label}`}
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            Drag & drop or click to upload
                        </span>
                    </div>
                </div>
                {previewUrl && (
                    <Image
                        sizes="100%"
                        src={previewUrl}
                        alt={`${label} Preview`}
                        className="rounded-lg border w-full dark:border-gray-700"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="mx-auto mt-10 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Upload KYC Documents</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a clear image of the front and back of your National ID or Driver&apos;s License.
            </p>

            {kycStatus === "reviewing" ? (
                <div className="p-4 text-sm rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-800/10 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-600">
                    Your KYC is currently <strong>{kycStatus}</strong>. You cannot resubmit at this time.
                </div>
            ) : null}

            {kycStatus === "approved" ? (
                <div className="p-4 text-sm rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-800/10 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-600">
                    Your KYC was <strong>{kycStatus}</strong>. You cannot resubmit at this time.
                </div>
            ) : null}

            {kycStatus === "rejected" ? (
                <div className="p-4 text-sm rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-800/10 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-600">
                    Your KYC was <strong>{kycStatus}</strong>. Please resubmit your KYC documents.
                </div>
            ) : null}

            {(!kycStatus || kycStatus === "pending" || kycStatus === "rejected") && (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        <DropInput
                            label="Front of ID"
                            previewUrl={frontUrl}
                            onFileSelect={(file) => {
                                setFrontFile(file);
                                setFrontUrl(URL.createObjectURL(file));
                            }}
                        />
                        <DropInput
                            label="Back of ID"
                            previewUrl={backUrl}
                            onFileSelect={(file) => {
                                setBackFile(file);
                                setBackUrl(URL.createObjectURL(file));
                            }}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        {uploading ? "Uploading..." : "Submit KYC"}
                    </Button>
                </>
            )}
        </div>
    );
}

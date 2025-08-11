"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
// import { v4 as uuidv4 } from "uuid";
import Button from "../ui/button/Button";
import Image from "next/image";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, PROFILE_COLLECTION_ID, RECEIPTS_BUCKET, storage } from "@/lib/appwrite/client";
import { ID, Query } from "appwrite";

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
            try {
                // Get the logged-in user
                const user = await getUser();
                if (!user) return;

                // Query the profile collection for this user
                const profileResult = await databases.listDocuments(
                    DB_ID,
                    PROFILE_COLLECTION_ID,
                    [Query.equal("userId", user.$id)]
                );

                if (
                    !profileResult ||
                    !profileResult.documents ||
                    profileResult.documents.length === 0
                ) {
                    console.warn("No profile found for this user.");
                    return;
                }

                const doc = profileResult.documents[0];
                setKycStatus(doc.kycStatus); 
            } catch (error) {
                console.error("Error fetching KYC status:", error);
            }
        }
         fetchKYC();
    }, []);


 const uploadToStorage = async (file: File, label: "front" | "back") => {
        try {
            // Get logged-in user
            const user = await getUser();
            if (!user) {
                console.error("Not authenticated.");
                return null;
            }

            // Upload file to Appwrite Storage
            const upload = await storage.createFile(
                RECEIPTS_BUCKET,
                ID.unique(),
                file
            );

            // Get a public URL for the uploaded file
            const publicUrl = storage.getFileView(RECEIPTS_BUCKET, upload.$id);

            return publicUrl;
        } catch (error) {
            console.error(`Failed to upload ${label} image:`, error);
            return null;
        }
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
            const user = await getUser();
            if (!user) {
                console.error("Not authenticated.");
                return null;
            }

            const existing = await databases.listDocuments(
                DB_ID,
                PROFILE_COLLECTION_ID,
                [Query.equal("userId", user.$id)]
            );

            const documentId = existing.documents[0].$id;

            try {
                if (existing) {
                    await databases.updateDocument(
                        DB_ID,
                        PROFILE_COLLECTION_ID,
                        documentId,
                        {
                            kycStatus: 'reviewing',
                            kycFront: frontImageUrl,
                            kycBack: backImageUrl,
                        }
                    );

                } else {
                    await databases.updateDocument(
                        DB_ID,
                        PROFILE_COLLECTION_ID,
                        documentId,
                        {
                            kycStatus: 'reviewing',
                            kycFront: frontImageUrl,
                            kycBack: backImageUrl,
                        }
                    );
                }

                toast.success("KYC submitted successfully.");
                setKycStatus("reviewing");
                setFrontFile(null);
                setBackFile(null);
                setFrontUrl(null);
                setBackUrl(null);
            } catch {
                toast.error("Failed to submit KYC.");
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
                        width={400}
                        height={400}
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
                <div className="p-4 text-sm rounded-md bg-green-100 text-green-800 dark:bg-green-800/10 dark:text-green-400 border border-green-300 dark:border-green-600">
                    Your KYC was <strong>{kycStatus}</strong>. You cannot resubmit at this time.
                </div>
            ) : null}

            {kycStatus === "rejected" ? (
                <div className="p-4 text-sm rounded-md bg-red-100 text-red-800 dark:bg-red-800/10 dark:text-red-400 border border-red-300 dark:border-red-600">
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

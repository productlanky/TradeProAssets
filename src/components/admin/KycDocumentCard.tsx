"use client";

import React from "react";

interface KycDocumentCardProps {
    frontImageUrl?: string | null;
    backImageUrl?: string | null;
}

export default function KycDocumentCard({
    frontImageUrl,
    backImageUrl,
}: KycDocumentCardProps) {
    if (!frontImageUrl && !backImageUrl) return null;

    return (
        <div className="p-5 mt-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                        KYC Documents
                    </h4>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-6">
                        {frontImageUrl && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Front of ID</p>
                                <img
                                    src={frontImageUrl}
                                    alt="Front ID"
                                    className="w-full rounded-lg border dark:border-gray-700"
                                />
                            </div>
                        )}

                        {backImageUrl && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Back of ID</p>
                                <img
                                    src={backImageUrl}
                                    alt="Back ID"
                                    className="w-full rounded-lg border dark:border-gray-700"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

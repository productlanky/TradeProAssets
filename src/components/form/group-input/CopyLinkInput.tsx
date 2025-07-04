"use client";

import React, { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface CopyLinkInputProps {
    link: string;
    placeholder?: string;
}

const CopyLinkInput: React.FC<CopyLinkInputProps> = ({
    link
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.success('Link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.log("Failed to copy link:", error);
            toast.error("Failed to copy");
        }
    };

    return (
        <div className="relative flex flex-1">
            <input
                type="text"
                readOnly
                value={link}
                className="dark:bg-dark-900 h-11 flex-1 w-full pr-[84px] rounded-lg border border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />

            <button
                onClick={handleCopy}
                type="button"
                className="absolute right-0 h-full border-l border-gray-200 dark:border-gray-800 px-4 rounded-r-lg text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-white/70 dark:hover:text-white"
            >
                {copied ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckIcon size={16} /> Copied
                    </span>
                ) : (
                    <span className="flex items-center gap-1">
                        <CopyIcon size={16} /> Copy
                    </span>
                )}
            </button>
        </div>
    );
};

export default CopyLinkInput;

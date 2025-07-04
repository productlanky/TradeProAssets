"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { RiTelegram2Fill } from "react-icons/ri";
import { companyName } from "@/lib/data/info";

const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function InviteFriends() {
    const [inputValue, setInputValue] = useState("");
    const [emails, setEmails] = useState<string[]>([]);

    const addEmail = (email: string) => {
        const trimmed = email.trim().replace(/,$/, "");
        if (trimmed && isValidEmail(trimmed) && !emails.includes(trimmed)) {
            setEmails([...emails, trimmed]);
        }
        setInputValue("");
    };

    const removeEmail = (email: string) => {
        setEmails(emails.filter((e) => e !== email));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key;

        if ((key === "Enter" || key === ",") && inputValue.trim() !== "") {
            e.preventDefault();
            addEmail(inputValue);
        } else if (key === "Backspace" && inputValue === "" && emails.length > 0) {
            e.preventDefault();
            const updatedEmails = [...emails];
            updatedEmails.pop();
            setEmails(updatedEmails);
        }
    };

    const handleSendInvites = () => {
        if (emails.length === 0) return;
        alert(`Invitations sent to:\n${emails.join(", ")}`);
        setEmails([]);
        setInputValue("");
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-white/[0.03] dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Invite your friends</h2>
            <p className="text-gray-500 text-sm dark:text-gray-400 mb-6 font-normal">
                Insert your friend's addresses and send them invitations to join {companyName}!
            </p>

            {/* Invite by Email */}
            <div className="mb-6">
                <div className="flex w-full rounded-lg border appearance-none text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 flex-wrap gap-2 border-gray-300 dark:border-gray-700 p-1 bg-white ">
                    {emails.map((email) => (
                        <span
                            key={email}
                            className="flex items-center bg-brand-100 text-brand-800 text-sm rounded px-2 py-1"
                        >
                            {email}
                            <button
                                onClick={() => removeEmail(email)}
                                className="ml-1 hover:text-red-500"
                            >
                                <XIcon size={14} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        placeholder="Enter emails separated by commas"
                        className="flex-1 pl-3 min-w-[200px] border-none outline-none bg-transparent text-sm text-gray-700 dark:text-white"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />
                    <button
                        onClick={handleSendInvites}
                        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
                    >
                        <RiTelegram2Fill size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
}

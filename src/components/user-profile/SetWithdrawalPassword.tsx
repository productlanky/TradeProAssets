"use client";

import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
// import bcrypt from "bcryptjs"; // Use bcryptjs on client-side (or hash on server if needed)

interface SetWithdrawalPasswordProps {
    refresh?: () => void;
    hasPassword?: boolean;
}

export default function SetWithdrawalPassword({
    refresh,
    hasPassword
}: SetWithdrawalPasswordProps) {
    const { isOpen, openModal, closeModal } = useModal();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || password.length < 6) {
            return toast.error("Password must be at least 6 characters.");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        setLoading(true);

        try {
            // const hashed = bcrypt.hashSync(password, 10); // hash password client-side

            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from("profiles")
                .update({ withdrawal_password: password })
                .eq("id", user?.id);

            if (error) {
                console.error(error);
                toast.error("Failed to save withdrawal password.");
            } else {
                toast.success(
                    hasPassword ? "Password updated successfully." : "Password set successfully."
                );
                closeModal();
                refresh?.();
                setPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.");
        }

        setLoading(false);
    };

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Withdrawal Password
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {hasPassword
                                ? "You’ve set a withdrawal password."
                                : "You haven’t set a withdrawal password yet."}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={openModal}
                        className="mt-4 lg:mt-0"
                        variant={hasPassword ? "outline" : "primary"}
                    >
                        {hasPassword ? "Update Password" : "Set Password"}
                    </Button>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
                <div className="relative w-full p-4 bg-white dark:bg-gray-900 rounded-3xl lg:p-10">
                    <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                        {hasPassword ? "Update Withdrawal Password" : "Set Withdrawal Password"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        This 8 digits password will be required when withdrawing funds.
                    </p>

                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                        </div>

                        <div>
                            <Label>Confirm Password</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button size="sm" variant="outline" onClick={closeModal} type="button">
                                Cancel
                            </Button>
                            <Button size="sm" type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save Password"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}

"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Input from "../form/input/InputField";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

interface UserRow {
    id: string;
    name: string;
    image: string;
    email: string;
    gender: string;
    country: string;
    phone: string;
    balance: number;
    created_at: string;
}

export default function UsersTable() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, first_name, last_name, photo_url, email, gender, country, phone, balance, is_admin, created_at")
                .neq("is_admin", true);

            if (error || !data) {
                console.error("Fetch error:", error?.message);
                return;
            }

            const formatted = data.map((u) => ({
                id: u.id,
                name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
                image: u.photo_url ?? "/images/user/owner.jpg",
                email: u.email ?? "—",
                gender: u.gender ?? "—",
                country: u.country ?? "—",
                phone: u.phone ?? "—",
                balance: parseFloat(u.balance) || 0,
                created_at: u.created_at,
            }));

            setUsers(formatted);
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total users: <span className="font-semibold">{filteredUsers.length}</span>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1100px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow className="text-left">
                                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                                        User
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                                        Email
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                                        Gender
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                                        Country
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                                        Phone
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                                        Balance
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/profiles/${user.id}`}
                                                    className="flex items-center gap-2 hover:underline underline-offset-2 transition-all ease-in-out duration-200"
                                                >
                                                    <div className="w-10 h-10 overflow-hidden rounded-full">
                                                        <Image
                                                            width={40}
                                                            height={40}
                                                            src={user.image}
                                                            alt={user.name}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm text-start text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm text-start text-gray-500 dark:text-gray-400">
                                            {user.gender}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm text-start text-gray-500 dark:text-gray-400">
                                            {user.country}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm text-start text-gray-500 dark:text-gray-400">
                                            {user.phone}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-theme-sm text-start text-gray-800 dark:text-white">
                                            ${user.balance.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-start">
                                            <Badge
                                                size="sm"
                                                color="success"
                                            >
                                                Active
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

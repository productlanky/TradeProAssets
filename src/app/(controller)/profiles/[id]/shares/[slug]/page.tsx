'use client'


import AdminUserStockTable from '@/components/admin/AdminUserStockTable'
import { ChevronLeftIcon } from '@/icons';
import Link from 'next/link';
import React, { use } from 'react'

export default function AdminUserStocksPage({ params }: { params: Promise<{ id: string, slug: string }> }) {
    const { id, slug } = use(params);
    return (
        <div>
            <div className="w-full px-10 sm:pt-10 mx-auto mb-5">
                <Link
                    href={`/profiles/${id}`}
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon />
                    Back to home
                </Link>
            </div>
            <AdminUserStockTable userId={slug} />
        </div>
    )
}


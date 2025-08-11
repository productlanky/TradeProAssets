'use client'

import UsersTable from '@/components/admin/UsersProfiles'
import ComponentCard from '@/components/common/ComponentCard'
import { logOut } from '@/lib/appwrite/auth'
import React from 'react'

export default function page() {
    const remove = async () => {
        await logOut();
    }

    return (
        <div className="p-5">
            <ComponentCard title="Users">
                <UsersTable />
            </ComponentCard>
        </div>
    )
}

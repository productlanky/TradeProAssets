import UsersTable from '@/components/admin/UsersProfiles'
import ComponentCard from '@/components/common/ComponentCard'
import React from 'react'

export default function page() {
    return (
        <div className="p-5">
            <ComponentCard title="Users">
                <UsersTable />
            </ComponentCard>
        </div>
    )
}

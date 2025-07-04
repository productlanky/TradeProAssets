import Link from 'next/link'
import React from 'react'

export default function page() {
    return (




        <div className="flex items-center justify-center gap-6 h-screen">
            <Link href={'/signin'}>
                Login
            </Link>
            <Link href={'/signup'}>
                Sign Up
            </Link>
        </div>

    )
}

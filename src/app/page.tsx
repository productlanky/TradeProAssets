import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
            <header className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-2xl font-bold">InvestBank</h1>
                <div className="space-x-4">
                    <Link
                        href="/signin"
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                        Log In
                    </Link>
                    <Link
                        href="/signup"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Sign Up
                    </Link>
                </div>
            </header>

            <section className="flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
                <h2 className="text-4xl font-extrabold md:text-5xl max-w-3xl leading-tight">
                    Grow Your Wealth with Smart Investments
                </h2>
                <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-300">
                    Join thousands of investors making smarter financial decisions with InvestBank. Secure, scalable, and rewarding.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/signup"
                        className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-base font-medium"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="/signin"
                        className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Log In
                    </Link>
                </div>
            </section>

            <footer className="mt-12 px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                &copy; {new Date().getFullYear()} InvestBank. All rights reserved.
            </footer>
        </main>
    );
}

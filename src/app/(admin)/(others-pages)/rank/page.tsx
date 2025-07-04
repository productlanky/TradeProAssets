
import BadgePage from "@/components/badge/BadgePage";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
    description:
        "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};


export default function Badge() {
    return (
        <BadgePage />
    );
}

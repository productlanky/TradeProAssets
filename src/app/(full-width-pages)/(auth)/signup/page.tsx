import SignUpForm from "@/components/auth/SignUpForm";
import Loading from "@/components/ui/Loading";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Next.js SignUp Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js SignUp Page TailAdmin Dashboard Template",
  // other metadata
};

export default function SignUp() {
  return <Suspense fallback={<Loading />}>
    <SignUpForm />
  </Suspense>;
}

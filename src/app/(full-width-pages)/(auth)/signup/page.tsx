import SignUpForm from "@/components/auth/SignUpForm";
import Loading from "@/components/ui/Loading";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Trade Pro - Blockchain Company",
  description:
    "Earn huge return on investment. With our professional team of Traders, you are guaranteed of your earnings.",
};


export default function SignUp() {
  return <Suspense fallback={<Loading />}>
    <SignUpForm />
  </Suspense>;
}

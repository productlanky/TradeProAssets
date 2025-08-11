import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade Pro - Blockchain Company",
  description:
    "Earn huge return on investment. With our professional team of Traders, you are guaranteed of your earnings.",
};


export default function SignIn() {
  return <SignInForm />;
}

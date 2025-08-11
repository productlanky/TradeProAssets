"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInSchema } from "@/lib/validations/auth";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { getUser, logIn } from "@/lib/appwrite/auth";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)

  const [section, setSection] = useState<null | Awaited<ReturnType<typeof getUser>>>(null)
  const pathname = usePathname();

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const user = await getUser();

        setSection(user)
      } catch (err) {
        console.log("Failed to fetch section", err);
      }
    };

    fetchSection();
  }, []);

  useEffect(() => {
    if (section && pathname !== "/dashboard") {
      router.replace('/dashboard')
    }
  }, [section, pathname, router]);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      keepMeLoggedIn: false,
    },
  });

  const onSubmit = async (data: SignInSchema) => {
    const { email, password } = data;
    setLoading(true);


    try {

      // ✅ Try to log in
      const response = await logIn(email, password);

      if (!response) {
        toast.error("Login failed");
        return;
      }

      const user = await getUser();

      // ✅ Redirect based on admin status
      if (user.labels?.includes("admin")) {
        router.push("/controlPanel"); // change this path to your admin dashboard
      } else {
        router.push("/dashboard"); // regular user dashboard
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Login failed");

    } finally {
      // ✅ Always stop loading
      setLoading(false);
    }

  };


  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full pb-10">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>Email <span className="text-error-500">*</span></Label>
                  <Input
                    placeholder="example@domain.com"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>



                <div>
                  <Label>Password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>


                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox {...register("keepMeLoggedIn")} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div>
                  <Button className="w-full" size="sm">
                    {
                      loading ?
                        <div className="flex items-center justify-center gap-2">
                          <Loader2Icon className="animate-spin" />
                          Signing in...
                        </div>
                        : 'Sign in'
                    }
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpSchema } from "@/lib/validations/auth";

import { usePathname, useSearchParams } from "next/navigation";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronDownIcon, ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import { Country, State, City } from "country-state-city";
import PhoneInput from "../form/group-input/PhoneInput";
import { nanoid } from 'nanoid';
import { getUser, signUp } from "@/lib/appwrite/auth";
import { databases, DB_ID, NOTIFICATION_COLLECTION, PROFILE_COLLECTION_ID, TRANSACTION_COLLECTION } from "@/lib/appwrite/client";
import { ID, Permission, Role } from "appwrite";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)

  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    defaultValues: {
      phone: "+234",
      referred_by: ref || "",
    },
    resolver: zodResolver(signUpSchema),
  });

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



  const [countryCode, setCountryCode] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

  console.log("Selected state:", selectedState);
  // Get all countries for select options
  const countries = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const genders = [
    {
      value: 'male',
      label: 'Male'
    },
    {
      value: 'female',
      label: 'Female'
    },
    {
      value: 'others',
      label: 'Others'
    }
  ]

  const handleCountryChange = (isoCode: string) => {
    setSelectedCountry(isoCode);

    const selectedCountry = Country.getCountryByCode(isoCode);
    if (selectedCountry) {
      setCountryCode("+" + selectedCountry.phonecode);
    }

    const countryStates = State.getStatesOfCountry(isoCode).map((state) => ({
      value: state.isoCode,
      label: state.name,
    }));

    if (countryStates.length > 0) {
      setStates(countryStates);
    } else {
      setStates([]);
      setCities([]); // No states, no cities
    }
  };


  const handleStateChange = (isoCode: string) => {
    setSelectedState(isoCode);
    const stateCities = City.getCitiesOfState(selectedCountry, isoCode).map((city) => ({
      value: city.name,
      label: city.name,
    }));
    setCities(stateCities);
  };


  const onSubmit = async (data: SignUpSchema) => {

    setLoading(true);

    const {
      email,
      password,
      fname,
      lname,
      gender,
      date_of_birth,
      phone,
      country,
      address,
      zip,
      city,
      state,
      referred_by
    } = data;

    // Generate referral code
    const referral_code = `${fname.toLowerCase()}${nanoid(6)}`;

    // Resolve full names
    const selectedCountryObj = Country.getCountryByCode(country);
    const selectedStateObj = state && country ? State.getStateByCodeAndCountry(state, country) : undefined;

    const fullCountryName = selectedCountryObj?.name || country;
    const fullStateName = selectedStateObj?.name || state;

    const cleanedPhone = phone.startsWith('+') ? phone.slice(1) : phone;
    const fullPhoneNumber = `${countryCode}${cleanedPhone}`;

    const name = `${fname} ${lname}`;

    try {
      // Create user with email and password
      const user = await signUp(email, password, name);

      await databases.createDocument(DB_ID, PROFILE_COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        email,
        firstName: fname,
        lastName: lname,
        gender,
        dob: date_of_birth,
        country: fullCountryName,
        state: fullStateName,
        city,
        zip,
        address,
        phone: fullPhoneNumber,
        referredBy: referred_by,
        tierLevel: 1,
        balance: 10,
        refereeId: referral_code,
        withdrawalPassword: "",
        kycStatus: "pending",
      }, [
        Permission.read(Role.any()),
        Permission.write(Role.any())
      ]);

      // Create Notification
      await databases.createDocument(DB_ID, NOTIFICATION_COLLECTION, ID.unique(), {
        userId: user.$id,
        title: "Welcome!",
        message: "Your account has successfully been created.",
        type: "info",
        read: false,
      }, [
        Permission.read(Role.any()),
        Permission.write(Role.any())
      ]);

      // Create a welcome bonus transaction
      await databases.createDocument(DB_ID, TRANSACTION_COLLECTION, ID.unique(), {
        userId: user.$id,
        amount: 10,
        status: "approved",
        type: "Welcome Bonus",
      }, [
        Permission.read(Role.any()),
        Permission.write(Role.any())
      ]);

      toast("Login your account.");
      setLoading(false);
      setTimeout(() => router.push("/signin"), 3000);

      return user;
    } catch (error: any) {
      if (error?.message?.includes("already exists")) {
        toast.error("Email already registered. Try signing in.");
      } else {
        toast.error("An error occurred during sign-up. Please try again.");
      }
      console.error("Sign-up error:", error);
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar pb-10">
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
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* First Name */}
                  <div>
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter your first name"
                      {...register("fname")}
                    />
                    {errors.fname && (
                      <p className="text-sm text-red-500 mt-1">{errors.fname.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter your last name"
                      {...register("lname")}
                    />
                    {errors.lname && (
                      <p className="text-sm text-red-500 mt-1">{errors.lname.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
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
                    <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label>
                    Confirm Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Re-enter your password"
                      type={showPassword ? "text" : "password"}
                      {...register("confirm_password")}
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
                  {errors.confirm_password && (
                    <p className="text-sm text-red-500 mt-1">{errors.confirm_password.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Gender */}
                  <div>
                    <div>
                      <Label>Gender</Label>
                      <div className="relative">
                        <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={genders}
                              placeholder="Select an option"
                              className="dark:bg-dark-900"
                            />
                          )}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <Controller
                      name="date_of_birth"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <DatePicker
                          id="date-picker"
                          label="Date of Birth"
                          placeholder="Select a date"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Country */}
                  <div>
                    <Label>Country</Label>

                    <div className='relative'>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={countries}
                            placeholder="Select country"
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              handleCountryChange(value);
                            }}
                          />
                        )}
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <Label>State</Label>
                    <div className='relative'>
                      <Controller
                        name="state"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={states}
                            placeholder="Select state"
                            disabled={states.length === 0}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleStateChange(value);
                            }}
                          />
                        )}
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* City */}

                  <div>
                    <Label>City</Label>
                    <div className='relative'>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={cities}
                            placeholder="Select city"
                            disabled={cities.length === 0}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                    {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                  </div>


                  {/* ZIP Code */}
                  <div>
                    <Label>ZIP Code</Label>
                    <Input placeholder="ZIP" {...register("zip")} />
                    {errors.zip && <p className="text-sm text-red-500">{errors.zip.message}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label>Phone Number</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        countries={[
                          { code: countryCode, label: countryCode }
                        ]}
                        placeholder="Enter your phone"
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />

                  {/* <Input type="tel" placeholder={countryCode} {...register("phone")} /> */}
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                {/* Address */}
                <div>
                  <Label>Address</Label>
                  <Input placeholder="Address" {...register("address")} />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>


                {/* Referral */}
                <div>
                  <Label>Referral</Label>
                  <Input placeholder="Referral code"
                    readonly={!!ref}
                    {...register("referred_by")} />
                  {errors.referred_by && <p className="text-sm text-red-500">{errors.referred_by.message}</p>}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox className="w-5 h-5" {...register("terms")} />
                  <p className="inline-block font-normal text-sm text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-500 -mt-4">{errors.terms.message}</p>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  >
                    {
                      loading ?
                        <div className="flex items-center justify-center gap-2">
                          <Loader2Icon className="animate-spin" />
                          Please wait
                        </div>
                        : 'Sign Up'
                    }
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {' '}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import KycDocumentCard from "./KycDocumentCard";
import Link from "next/link";

interface Props {
  id: string;
}

type ProfileField =
  | "first_name"
  | "last_name"
  | "email"
  | "gender"
  | "phone"
  | "country"
  | "state"
  | "city"
  | "zip"
  | "address"
  | "balance"
  | "dob";

interface ProfileType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  address: string;
  balance: number;
  dob: string;
  created_at: string;
}

interface KycRequestType {
  status: string;
  front_image_url: string | null;
  back_image_url: string | null;
}

const profileFields: ProfileField[] = [
  "first_name",
  "last_name",
  "email",
  "gender",
  "phone",
  "country",
  "state",
  "city",
  "zip",
  "address",
  "balance",
  "dob",
];

const displayFields = [...profileFields, "created_at", "kyc_status"];

const kycStatusOptions = [
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "In Review", value: "reviewing" },
];

export default function AdminUserProfileCard({ id }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [form, setForm] = useState<Partial<ProfileType>>({});
  const [kycStatus, setKycStatus] = useState<string>("");
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null);
  const [backImageUrl, setBackImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single<ProfileType>();

      const { data: kyc } = await supabase
        .from("kyc_requests")
        .select("status, front_image_url, back_image_url")
        .eq("user_id", id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .returns<KycRequestType[]>();

      if (profileError) {
        toast.error("Failed to fetch user");
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setForm(profileData);
      }

      if (kyc && kyc.length > 0) {
        setKycStatus(kyc[0].status || "");
        setFrontImageUrl(kyc[0].front_image_url || null);
        setBackImageUrl(kyc[0].back_image_url || null);
      }

      setLoading(false);
    };

    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const key = name as keyof ProfileType;
    const newValue = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setForm((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updatedFields: { [K in ProfileField]?: string | number } = {};

    for (const key of profileFields) {
      const current = profile[key];
      const edited = form[key];

      const changed =
        key === "dob"
          ? edited !== undefined &&
          new Date(current as string).toISOString().split("T")[0] !==
          new Date(edited as string).toISOString().split("T")[0]
          : current !== edited && edited !== undefined;

      if (changed && edited !== undefined) {
        updatedFields[key] = edited as string | number;
      }
    }

    if (Object.keys(updatedFields).length > 0) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(updatedFields)
        .eq("id", id);

      if (profileError) {
        toast.error("Failed to update user");
        return;
      }
    }

    const { error: kycError } = await supabase
      .from("kyc_requests")
      .update({ status: kycStatus })
      .eq("user_id", id);

    if (kycError) {
      toast.error("Failed to update KYC status");
      return;
    }

    toast.success("User updated successfully");
    closeModal();

    setProfile((prev) =>
      prev
        ? {
          ...prev,
          ...Object.fromEntries(
            Object.entries(updatedFields).map(([key, value]) => [
              key,
              typeof value === "number" && (key === "balance" || key === "zip")
                ? value
                : String(value),
            ])
          ),
        }
        : prev
    );
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!profile) return <div className="p-6 text-red-500 text-center">User not found.</div>;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Profile Details
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              {displayFields.map((field) => (
                <div key={field}>
                  <p className="mb-1 text-xs text-gray-500 capitalize dark:text-gray-400">
                    {field.replace("_", " ")}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {field === "created_at" || field === "dob"
                      ? profile[field as keyof ProfileType]
                        ? new Date(profile[field as keyof ProfileType] as string).toLocaleDateString()
                        : "-"
                      : field === "kyc_status"
                        ? kycStatus ?? "-"
                        : (profile[field as keyof ProfileType] ?? "-")}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={openModal} className="btn-edit">Edit</button>
        </div>
      </div>

      <div className="flex flex-wrap mt-6 items-start gap-3 lg:items-end">
        <Link href={`/profiles/${id}/investments`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">View Investments</Link>
        <Link href={`/profiles/${id}/transactions`} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">View Transactions</Link>
      </div>

      <KycDocumentCard frontImageUrl={frontImageUrl} backImageUrl={backImageUrl} />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="modal-body p-8">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update user details
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {profileFields.map((field) => (
                  <div key={field} className={field === "address" ? "lg:col-span-2" : ""}>
                    <Label>{field.replace("_", " ").toUpperCase()}</Label>
                    <Input
                      type={
                        field === "balance" || field === "zip"
                          ? "number"
                          : field === "dob"
                            ? "date"
                            : "text"
                      }
                      name={field}
                      value={form[field] ?? ""}
                      onChange={handleChange}
                    />
                  </div>
                ))}
                <div className="lg:col-span-2">
                  <Label>KYC STATUS</Label>
                  <Select
                    options={kycStatusOptions}
                    placeholder="Select status"
                    className="dark:bg-dark-900"
                    value={kycStatus}
                    onValueChange={setKycStatus}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

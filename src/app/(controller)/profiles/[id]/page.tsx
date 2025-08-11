"use client";

import React, { useEffect, useState, use } from "react"; 
import AdminUserProfileEditor from "@/components/admin/AdminProfileEditor";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons"; 
import { useRouter } from "next/navigation";
import { databases, DB_ID, PROFILE_COLLECTION_ID } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import Loading from "@/components/ui/Loading";

interface Props {
  params: Promise<{ id: string }>;
}

interface Profile {
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
  kyc_status?: string;
}

export default function Page({ params }: Props) {
  // ✅ unwrap the promise
  const { id } = use(params);

  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {

        // Fetch the profile document using their $id
        const res = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("$id", id)]
        );

        if (!res.documents.length) {
          console.error("User profile not found");
          return;
        }

        const doc = res.documents[0];
        const profile: Profile = {
          id: doc.$id,
          first_name: doc.firstName,
          last_name: doc.lastName,
          email: doc.email,
          gender: doc.gender,
          phone: doc.phone,
          country: doc.country,
          state: doc.state,
          city: doc.city,
          zip: doc.zip,
          address: doc.address,
          balance: doc.balance,
          dob: doc.dob,
          created_at: doc.$createdAt,
          kyc_status: doc.kycStatus,
        };
        setUser(profile); // store the profile in state
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);


  if (loading) return <Loading/>;
  if (!user) return <div className="p-6 text-center text-red-500">User not found.</div>;

  return (
    <div className="p-5">
      <div className="w-full px-10 sm:pt-10 mx-auto mb-5">
        <Link
          href="/controlPanel"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to home
        </Link>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold capitalize text-gray-800 dark:text-white/90 lg:mb-7">
          {user.first_name} {user.last_name} Profile
        </h3>
        <AdminUserProfileEditor id={id} />
      </div>
    </div>
  );
}

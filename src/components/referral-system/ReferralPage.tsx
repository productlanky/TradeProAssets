"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import RefBonus from "./RefBonus";
import RefOptions from "./RefOptions";
import InviteFriends from "./InviteFriends";
import ReferredUsersTable from "./ReferredUsersTable";
import { useRef } from "react";
import Button from "../ui/button/Button";
import { getUser } from "@/lib/appwrite/auth";
import { databases, DB_ID, PROFILE_COLLECTION_ID } from "@/lib/appwrite/client";
import { Query } from "appwrite";


type ReferredUser = {
  id: string;
  bonus: number;
  referred_by: string;
  created_at: string;
  profiles: {
    email: string;
    created_at: string;
  };
};


export default function ReferralPage() {
  const [referralLink, setReferralLink] = useState("");
  const [totalReferred, setTotalReferred] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";

  useEffect(() => {
    async function fetchReferralInfo() {
      try {
        // 1️⃣ Get signed-in user
        const user = await getUser().catch(() => null);
        if (!user) return;

        // 2️⃣ Fetch profile (referral code)
        const profileRes = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("userId", user.$id)]
        );
        const profileDoc = profileRes.documents[0];

        const code = profileDoc?.refereeId;
        if (code) {
          setReferralLink(`${baseUrl}/signup?ref=${code}`);
        }

        // 3️⃣ Fetch referrals + join profiles manually (no joins in Appwrite)
        const referralsList = await databases.listDocuments(
          DB_ID,
          PROFILE_COLLECTION_ID,
          [Query.equal("referredBy", profileDoc.refereeId)],
        );

        // If you want referred users' emails, you’d need to loop & fetch each profile
        const referralsWithProfiles = await Promise.all(
          referralsList.documents.map(async (ref) => {
            return {
              id: ref.$id,
              bonus: 10,
              referred_by: ref.referredBy || "",
              created_at: ref.$createdAt,
              profiles: {
                email: ref.email,
                created_at: ref.$createdAt,
              },
            } as ReferredUser;
          })
        );

        setReferredUsers(referralsWithProfiles);
        setTotalReferred(referralsList.total);

        const totalBonus = totalReferred * 10
        setReferralBonus(totalBonus);

      } catch (error) {
        console.error("Error fetching referral info:", error);
      }
    }

    fetchReferralInfo();
  }, [baseUrl]);


  const qrRef = useRef<HTMLCanvasElement>(null);

  const handleDownloadQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "referral-qr.png";
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-10 pt-5">
      <h2 className="text-2xl font-semibold mb-6">Refer & Earn Rewards</h2>

      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-8">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <RefBonus totalReferred={totalReferred} referralBonus={referralBonus} />
          <InviteFriends />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-5 row-span-2">
          {referralLink && (
            <div className="flex flex-col items-center bg-white p-6 shadow-sm dark:bg-white/[0.03] justify-center gap-5 text-center border rounded-2xl">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-0 pb-0">
                  Scan to Sign Up
                </h2>
                <p className="text-sm text-muted-foreground text-center max-w-xs mb-2">
                  Share this QR code with others to easily invite them using your referral link.
                </p>
              </div>

              <QRCodeCanvas
                ref={qrRef}
                value={referralLink}
                size={250}
                className="dark:invert"
              />



              <Button variant="outline"
                className="w-full"
                onClick={handleDownloadQR}
              >
                Download QR Code
              </Button>
            </div>
          )}

        </div>

        <div className="col-span-12 py-10 xl:col-span-7">
          <RefOptions referralLink={referralLink} />
        </div>
      </div>

      <ReferredUsersTable referredUsers={referredUsers} />
    </div>
  );
}

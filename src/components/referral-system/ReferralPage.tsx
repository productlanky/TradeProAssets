"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { QRCodeCanvas } from "qrcode.react";
import RefBonus from "./RefBonus";
import RefOptions from "./RefOptions";
import InviteFriends from "./InviteFriends";
import ReferredUsersTable from "./ReferredUsersTable";
import { useRef } from "react";
import Button from "../ui/button/Button";


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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

      const code = profile?.referral_code;
      if (code) {
        setReferralLink(`${baseUrl}/signup?ref=${code}`);
      }

      const { data: referrals } = await supabase
        .from("referrals")
        .select("*, profiles(email, created_at)")
        .eq("referred_by", user.id);

      setReferredUsers(referrals || []);
      setTotalReferred(referrals?.length || 0);

      const total = referrals?.reduce((sum, ref) => sum + (ref.bonus || 0), 0);
      setReferralBonus(total || 0);
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

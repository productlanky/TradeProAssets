'use client';
import { useEffect, useState, useCallback } from 'react';
import UserMetaCard from './UserMetaCard';
import UserInfoCard from './UserInfoCard';
import UserAddressCard from './UserAddressCard';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import SetWithdrawalPassword from './SetWithdrawalPassword';
import KYCUpload from './KycUpload';
import Loading from '../ui/Loading';

export interface ProfileType {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    zip: string;
    address: string;
    gender: string;
    dob: string;
    referral_code: string;
    referred_by: string | null;
    photo_url: string | null;
    created_at: string;
    tier_level: number;
    tiers?: {
        name: string;
    };
    withdrawal_password?: string | null;
    refresh: () => void;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Not logged in');
            router.replace('/signin');
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                tiers (
                    name,
                    min_referrals
                )
            `)
            .eq('id', user.id)
            .single();

        setLoading(false);

        if (error || !data) {
            console.error(error?.message || 'No profile found');
        } else {
            setProfile({ ...data, refresh: fetchProfile });
        }
    }, [router]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return <Loading />;
    }
    if (!profile) return <div className="text-center text-red-500">Could not load profile.</div>;

    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                    Profile
                </h3>
                <div className="space-y-6">
                    <UserMetaCard {...profile} />
                    <UserInfoCard {...profile} />
                    <UserAddressCard {...profile} refresh={fetchProfile} />
                    <SetWithdrawalPassword
                        refresh={fetchProfile}
                        hasPassword={!!profile.withdrawal_password}
                    />
                    <KYCUpload />
                </div>


            </div>
        </div>
    );
}

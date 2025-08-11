'use client';
import { useEffect, useState, useCallback } from 'react';
import UserMetaCard from './UserMetaCard';
import UserInfoCard from './UserInfoCard';
import UserAddressCard from './UserAddressCard'; 
import { useRouter } from 'next/navigation';
import SetWithdrawalPassword from './SetWithdrawalPassword';
import KYCUpload from './KycUpload';
import Loading from '../ui/Loading';
import { databases, DB_ID, PROFILE_COLLECTION_ID } from '@/lib/appwrite/client';
import { Query } from 'appwrite';
import { getUser } from '@/lib/appwrite/auth';

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
        const user = await getUser();
        if (!user) return;

        const profileResult = await databases.listDocuments(
            DB_ID,
            PROFILE_COLLECTION_ID,
            [Query.equal("userId", user.$id)]
        );

        if (!user) {
            console.error('Not logged in');
            router.replace('/signin');
            return;
        }

        setLoading(false);

        if (!profileResult || !profileResult.documents || profileResult.documents.length === 0) {
            console.error('No profile found');
        } else {
            const doc = profileResult.documents[0];
            setProfile({
                id: doc.id ?? doc.$id,
                first_name: doc.firstName,
                last_name: doc.lastName,
                email: doc.email,
                phone: doc.phone,
                country: doc.country,
                state: doc.state,
                city: doc.city,
                zip: doc.zip,
                address: doc.address,
                gender: doc.gender,
                dob: doc.dob,
                referral_code: doc.refereeId,
                referred_by: doc.referredBy,
                photo_url: doc.photo_url,
                created_at: doc.created_at ?? doc.$createdAt,
                tier_level: doc.tierLevel,
                tiers: doc.tiers,
                withdrawal_password: doc.withdrawalPassword,
                refresh: fetchProfile,
            });
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

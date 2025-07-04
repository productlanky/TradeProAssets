import React from 'react'
import Button from '../ui/button/Button'; 
import CopyLinkInput from '../form/group-input/CopyLinkInput';
import { FaXTwitter, FaWhatsapp } from 'react-icons/fa6';

export default function RefOptions({ referralLink }: { referralLink: string }) {

    const shareOnTwitter = () => {
        const msg = encodeURIComponent(
            `Join me on this awesome bank app and earn rewards! ${referralLink}`
        );
        window.open(`https://twitter.com/intent/tweet?text=${msg}`, "_blank");
    };

    const shareOnWhatsApp = () => {
        const msg = encodeURIComponent(
            `Get rewarded by joining this amazing bank platform: ${referralLink}`
        );
        window.open(`https://wa.me/?text=${msg}`, "_blank");
    };

    return (
        <div className='space-y-4'>
            {/* Share Referral Link */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-0 pb-0">
                    Share your referral link
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg mb-2">You can also share your referral link by copying and sending it or sharing it on you social media</p>
            </div>
            <CopyLinkInput link={referralLink} />
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <Button variant="outline" className='w-full md:w-auto' onClick={shareOnTwitter}>
                    <FaXTwitter size={16} className="text-black dark:text-white" />
                    Share on Twitter
                </Button>

                <Button variant="outline" className='w-full md:w-auto' onClick={shareOnWhatsApp}>
                    <FaWhatsapp size={16} className="text-[#25D366]" />
                    Share on WhatsApp
                </Button>
            </div>

        </div>
    )
}

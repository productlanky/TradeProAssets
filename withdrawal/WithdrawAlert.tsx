import React from "react";
import Alert from "../ui/alert/Alert";

export default function WithdrawAlert({ kycStatus, withdrawalPasswordSet }: { kycStatus: string; withdrawalPasswordSet: boolean }) {
  return (
    <div className="space-y-4 pb-4">
      {kycStatus !== "approved" && (
        <Alert
          variant="error"
          title="KYC Not Verified"
          message="Your KYC is not verified. Please complete KYC to enable withdrawals."
        />
      )}

      {!withdrawalPasswordSet && (
        <Alert
          variant="warning"
          title="Withdrawal Password"
          message="You haven’t set a withdrawal password yet. Please update your profile before proceeding."
        />
      )}
    </div>
  );
}
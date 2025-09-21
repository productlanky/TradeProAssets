import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select from "../form/Select";

const WITHDRAWAL_OPTIONS = [
  { label: "Bitcoin", value: "BTC" },
  { label: "Bank Transfer", value: "BANK" },
  { label: "PayPal", value: "PAYPAL" },
];

export type WithdrawFormFields = {
  amount: number;
  method: "BTC" | "BANK" | "PAYPAL";
  address?: string; // For Bitcoin
  bankName?: string; // For Bank Transfer
  accountNumber?: string; // For Bank Transfer
  accountName?: string; // For Bank Transfer
  paypalEmail?: string; // For PayPal
  password: string;
};

export default function WithdrawForm({
  onSubmit,
}: {
  onSubmit: SubmitHandler<WithdrawFormFields>;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WithdrawFormFields>({
    defaultValues: {
      method: "BTC",
    },
  });

  const selectedMethod = watch("method");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div>
        <Label>
          Amount<span className="text-error-500">*</span>
        </Label>
        <Input
          type="number"
          placeholder="Enter amount"
          {...register("amount", {
            required: "Amount is required",
            min: { value: 10, message: "Minimum amount is ₦10" },
          })}
          error={!!errors.amount}
          hint={errors.amount?.message}
        />
      </div>

      {/* Withdrawal Method */}
      <div>
        <Label>
          Withdrawal Method<span className="text-error-500">*</span>
        </Label>
        <Controller
          name="method"
          control={control}
          render={({ field }) => <Select {...field} options={WITHDRAWAL_OPTIONS} />}
        />
      </div>

      {/* Conditional Fields */}
      {selectedMethod === "BTC" && (
        <div>
          <Label>
            Wallet Address<span className="text-error-500">*</span>
          </Label>
          <Input
            placeholder="Enter wallet address"
            {...register("address", { required: "Wallet address is required" })}
            error={!!errors.address}
            hint={errors.address?.message}
          />
        </div>
      )}

      {selectedMethod === "BANK" && (
        <>
          <div>
            <Label>
              Bank Name<span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Enter bank name"
              {...register("bankName", { required: "Bank name is required" })}
              error={!!errors.bankName}
              hint={errors.bankName?.message}
            />
          </div>

          <div>
            <Label>
              Account Number<span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Enter account number"
              {...register("accountNumber", { required: "Account number is required" })}
              error={!!errors.accountNumber}
              hint={errors.accountNumber?.message}
            />
          </div>

          <div>
            <Label>
              Account Name<span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Enter account name"
              {...register("accountName", { required: "Account name is required" })}
              error={!!errors.accountName}
              hint={errors.accountName?.message}
            />
          </div>
        </>
      )}

      {selectedMethod === "PAYPAL" && (
        <div>
          <Label>
            PayPal Email Address<span className="text-error-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="Enter PayPal email"
            {...register("paypalEmail", { required: "PayPal email is required" })}
            error={!!errors.paypalEmail}
            hint={errors.paypalEmail?.message}
          />
        </div>
      )}

      {/* Withdrawal Password */}
      <div>
        <Label>
          Withdrawal Password<span className="text-error-500">*</span>
        </Label>
        <Input
          type="password"
          placeholder="Enter password"
          {...register("password", { required: "Password is required" })}
          error={!!errors.password}
          hint={errors.password?.message}
        />
      </div>

      <Button type="submit" className="w-full mt-3">
        Withdraw
      </Button>
    </form>
  );
}

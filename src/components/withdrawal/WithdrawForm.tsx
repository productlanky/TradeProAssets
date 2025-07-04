import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import Select from "../form/Select";

const CRYPTO_OPTIONS = [
  { label: "Bitcoin", value: "BTC" },
  { label: "Ethereum", value: "ETH" },
];

export type WithdrawFormFields = {
  amount: number;
  crypto: string;
  address: string;
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
    formState: { errors },
  } = useForm<WithdrawFormFields>({
    defaultValues: {
      crypto: "BTC",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div>
        <Label>
          Crypto Type<span className="text-error-500">*</span>
        </Label>
        <Controller
          name="crypto"
          control={control}
          render={({ field }) => <Select {...field} options={CRYPTO_OPTIONS} />}
        />
      </div>

      <div>
        <Label>
          Wallet Address<span className="text-error-500">*</span>
        </Label>
        <Input
          placeholder="Enter wallet address"
          {...register("address", { required: "Address is required" })}
          error={!!errors.address}
          hint={errors.address?.message}
        />
      </div>

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

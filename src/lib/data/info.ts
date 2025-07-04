export const companyName = 'Company Name';

export const tierList: {
  name: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  deposit: number;
  referrals: number;
  boost: number;
  color: string;
}[] = [
  { name: "Bronze", deposit: 0, referrals: 0, boost: 0, color: "border-gray-400" },
  { name: "Silver", deposit: 1000, referrals: 5, boost: 2, color: "border-slate-400" },
  { name: "Gold", deposit: 5000, referrals: 15, boost: 4, color: "border-yellow-500" },
  { name: "Platinum", deposit: 10000, referrals: 30, boost: 6, color: "border-purple-600" },
  { name: "Diamond", deposit: 20000, referrals: 50, boost: 10, color: "border-blue-500" },
];
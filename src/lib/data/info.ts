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




export const plan = [
  {
    id: "1",
    name: "Starter",
    description: "Basic plan for new users",
    interest_rate: 0.05,
    duration_days: 30,
    min_amount: 100,
  },
    {
    id: "2",
    name: "Standard",
    description: "Moderate risk investment",
    interest_rate: 0.08,
    duration_days: 60,
    min_amount: 300,
  },
  {
    id: "3",
    name: "Advanced",
    description: "Higher return plan",
    interest_rate: 0.10,
    duration_days: 90,
    min_amount: 500,
  },
  {
    id: "4",
    name: "Premium",
    description: "Premium plan for serious investors",
    interest_rate: 0.12,
    duration_days: 120,
    min_amount: 1000,
  },
  {
    id: "5",
    name: "Elite",
    description: "High reward long term",
    interest_rate: 0.15,
    duration_days: 180,
    min_amount: 2500,
  },
  {
    id: "6",
    name: "Ultra",
    description: "Top tier investment plan",
    interest_rate: 0.20,
    duration_days: 365,
    min_amount: 5000,
  },

  
];

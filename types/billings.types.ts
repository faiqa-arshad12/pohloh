export type Price = {
  id: string;
  interval: "month" | "year";
  amount: number;
  currency: string;
};

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  prices: Price[];
};

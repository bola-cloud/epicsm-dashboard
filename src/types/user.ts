export type User = {
  id: string;
  email: string;
  name: string;
  fcm?: string;
  photo?: string;
  provider?: string;
  lastSignIn?: {
    _seconds: number;
    _nanoseconds: number;
  };
  role: string;
  created: {
    _seconds: number;
    _nanoseconds: number;
  };
  coins: number;
  dailyRewards: number;
  dollars: number;
  isConfirmed: boolean;
  banned?: boolean;
  nextRewardDate?: Date;
};

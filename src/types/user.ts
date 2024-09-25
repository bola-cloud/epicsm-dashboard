export type User = {
  id: string;
  email: string;
  name?: string;
  prenom?: string;
  fcm?: string;
  photo?: string;
  provider?: string;
  lastSignIn?: Date;
  role: string;
  created: Date;
};

export type User = {
  _id: string;
  email: string;
  nom?: string;
  prenom?: string;
  fcm?: string;
  photo?: string;
  provider?: string;
  lastSignIn?: Date;
  role: string;
  created: Date;
};

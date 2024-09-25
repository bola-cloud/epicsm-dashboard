export type Admins = {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_image: string;
  password: string;
  role: "client" | "admin" | "host";
  createdAt: Date;
  updatedAt: Date;
};

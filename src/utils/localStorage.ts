import axios from "axios";

export const setAuthDataToLocalStorage = (resdData: any) => {
  if (typeof window !== "undefined") {
    const { email, host } = resdData.user;
    localStorage.setItem("jwt", resdData.jwt);
    localStorage.setItem("user", JSON.stringify(resdData.user));
  }
};

export const removeAuthDataFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
  }
};

export const getJwtFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem('jwt');
  }
};

export const getUserFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("user");
    if (userData) {
      return userData ? JSON.parse(userData) : null;
    }
  }
};

const getEmailUsername = (email: string) => {
  const match = email?.match(/^(.+)@/);
  return match ? match[1] : null;
};

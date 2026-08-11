import axios from "axios";

const baseURL =
    (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:3001";

const API = axios.create({
    baseURL,
});

export default API;

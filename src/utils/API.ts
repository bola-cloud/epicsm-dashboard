import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",
  // baseURL: "https://api.epicsm.goviral.ma",
});

export default API;

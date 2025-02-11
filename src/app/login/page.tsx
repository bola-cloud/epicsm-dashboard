"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import axios, { AxiosError } from "axios";
import { setAuthDataToLocalStorage } from "@/utils/localStorage";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import API from "@/utils/API";

const validationSchema = {
  email: {
    required: "L'e-mail est requis",
    pattern: { value: /^\S+@\S+$/i, message: "Adresse e-mail invalide" },
  },
  password: {
    required: "Mot de passe requis",
    minLength: {
      value: 6,
      message: "Le mot de passe doit être au moins de 6 caractères",
    },
  },
};

export interface PageLoginProps {}

const PageLogin: FC<PageLoginProps> = ({}) => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [Remember, setRemember] = useState(false);

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  if (getJwtFromLocalStorage()) {
    router.push("/");
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors({ ...errors, email: "", password: "" });

    // Perform validation onBlur
    if (name === "email" && !value) {
      setErrors({ ...errors, email: validationSchema.email.required });
    }
    if (name === "password" && !value) {
      setErrors({ ...errors, password: validationSchema.password.required });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Perform validation before submitting
    if (!email) {
      setErrors({ ...errors, email: validationSchema.email.required });
      return;
    } else if (!validationSchema.email.pattern.value.test(email)) {
      setErrors({ ...errors, email: validationSchema.email.pattern.message });
    }
    if (!password) {
      setErrors({ ...errors, password: validationSchema.password.required });
      return;
    } else if (password.length < validationSchema.password.minLength.value) {
      setErrors({
        ...errors,
        password: validationSchema.password.minLength.message,
      });
    }

    try {
      setLoading(true);

      const response = await API.post("/api/v3/login", {
        email: email,
        password: password,
        Remember: Remember,
      });

      if (response.status === 200) {
        setAuthDataToLocalStorage(response.data);
        router.push("/");
      } else {
        // Handle errors
        setError("E-mail ou mot de passe invalide");
      }
    } catch (error) {
      // Handle errors
      console.error("Error:", error);

      if ((error as AxiosError).response?.status === 404) {
        setError("Votre adresse n'est pas reconnue, inscrivez vous.");
      } else {
        setError("Une erreur s'est produite, veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100vh] w-full items-center justify-center">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 dark:text-neutral-100 md:text-5xl md:leading-[115%]">
          Login
        </h2>
        <div className="mx-auto max-w-md space-y-6">
          {/* ERROR */}
          {error && <span className="text-red">{error}</span>}
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email address
              </span>
              <input
                type="email"
                placeholder="Entrez votre adresse email"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
              />
              {errors.email && (
                <div className="error text-red-500 text-xs">{errors.email}</div>
              )}
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-neutral-800 dark:text-neutral-200">
                Password
              </span>
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur}
              />
              {errors.password && (
                <div className="error text-red-500 text-xs">
                  {errors.password}
                </div>
              )}
            </label>

            <label className="block">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="form-checkbox h-4 w-4 rounded-sm text-indigo-600"
                  checked={Remember}
                  onChange={() => setRemember(!Remember)}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-gray-600 dark:text-gray-400 ml-2 text-sm"
                >
                  Stay connected ?
                </label>
              </div>
            </label>

            {/* <Link
              href="/forget-password"
              className="flex justify-end text-sm font-medium"
            >
              J'ai oublié mon mot de passe
            </Link> */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
            >
              Se connecter
            </button>
          </form>

          {/* ==== */}
          {/* <span className="flex justify-end text-center text-neutral-700 dark:text-neutral-300">
            Vous n'avez pas de compte ? {`  `}
            <Link href="/signup" className="text-blue-400">
              {`  `} S'inscrire
            </Link>
          </span> */}

          {/* ==== */}
          <div className="h-16"></div>
          <span className="block text-center text-xs font-thin text-neutral-700 dark:text-neutral-300">
            By logging in or creating an account, you agree to our.{`  `}
            <Link href="/#" className="text-blue-400">
              terms and conditions
            </Link>
            {`  `} and {`  `}
            <Link href="/#" className="text-blue-400">
              privacy policy.
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

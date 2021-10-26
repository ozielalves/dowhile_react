import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "../models/user";
import { api } from "../services/api";

type AuthProvider = {
  children: ReactNode;
};

type AuthContextData = {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
};

interface AuthResponse {
  token: string;
  user: User;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${
    import.meta.env.VITE_GITHUB_CLIENT_ID
  }`;

  async function signIn(githubCode: string) {
    await api
      .post<AuthResponse>("authenticate", { code: githubCode })
      .then((response) => {
        const { token, user } = response.data;

        localStorage.setItem("@dowhile:token", token);
        
        api.defaults.headers.common.authorization = `Bearer ${token}`;
        
        setUser(user);
      })
      .catch((error) => console.log(error));
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api
        .get<User>("profile")
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => console.log(error));
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithCode);

      signIn(githubCode);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}

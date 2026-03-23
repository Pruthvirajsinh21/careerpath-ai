import { Ed25519KeyIdentity } from "@dfinity/identity";
import type { Identity } from "@icp-sdk/core/agent";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";

export type Status =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type InternetIdentityContext = {
  identity?: Identity;
  login: () => void;
  clear: () => void;
  loginStatus: Status;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError?: Error;
  registerWithCredentials: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
};

const IDENTITY_KEY = "cp_identity_v2";

async function deriveIdentity(
  email: string,
  password: string,
): Promise<Ed25519KeyIdentity> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(`careerpath-identity:${email.toLowerCase()}`),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return Ed25519KeyIdentity.generate(new Uint8Array(bits));
}

async function hashPassword(password: string, email: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${password}:${email.toLowerCase()}:cp-hash-v1`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function saveIdentity(identity: Ed25519KeyIdentity): void {
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity.toJSON()));
}

function loadStoredIdentity(): Ed25519KeyIdentity | null {
  try {
    const stored = localStorage.getItem(IDENTITY_KEY);
    if (!stored) return null;
    return Ed25519KeyIdentity.fromJSON(stored);
  } catch {
    return null;
  }
}

const Context = createContext<InternetIdentityContext | undefined>(undefined);

export const useInternetIdentity = (): InternetIdentityContext => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("InternetIdentityProvider not present");
  return ctx;
};

export function InternetIdentityProvider({
  children,
}: PropsWithChildren<{ createOptions?: unknown }>) {
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);

  // Restore session on mount
  useEffect(() => {
    const stored = loadStoredIdentity();
    if (stored) {
      setIdentity(stored);
      setStatus("success");
    } else {
      setStatus("idle");
    }
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(IDENTITY_KEY);
    setIdentity(undefined);
    setStatus("idle");
    setError(undefined);
  }, []);

  // Legacy no-op (was used to open II popup)
  const login = useCallback(() => {}, []);

  const registerWithCredentials = useCallback(
    async (
      username: string,
      email: string,
      password: string,
    ): Promise<void> => {
      setStatus("logging-in");
      setError(undefined);
      try {
        const id = await deriveIdentity(email, password);
        const hash = await hashPassword(password, email);
        // Create a temporary actor with the derived identity to register on backend
        const actor = await createActorWithConfig({
          agentOptions: { identity: id },
        });
        const adminToken = getSecretParameter("caffeineAdminToken") || "";
        await actor._initializeAccessControlWithSecret(adminToken);
        await (
          actor as unknown as {
            registerAccount: (u: string, e: string, p: string) => Promise<void>;
          }
        ).registerAccount(username, email, hash);
        saveIdentity(id);
        setIdentity(id);
        setStatus("success");
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Registration failed");
        setStatus("loginError");
        setError(err);
        throw err;
      }
    },
    [],
  );

  const loginWithCredentials = useCallback(
    async (email: string, password: string): Promise<void> => {
      setStatus("logging-in");
      setError(undefined);
      try {
        const id = await deriveIdentity(email, password);
        const hash = await hashPassword(password, email);
        // Validate credentials against backend
        const actor = await createActorWithConfig({
          agentOptions: { identity: id },
        });
        const adminToken = getSecretParameter("caffeineAdminToken") || "";
        await actor._initializeAccessControlWithSecret(adminToken);
        await (
          actor as unknown as {
            validateLogin: (e: string, p: string) => Promise<unknown>;
          }
        ).validateLogin(email, hash);
        saveIdentity(id);
        setIdentity(id);
        setStatus("success");
      } catch (e) {
        const err =
          e instanceof Error ? e : new Error("Invalid email or password");
        setStatus("loginError");
        setError(err);
        throw err;
      }
    },
    [],
  );

  const value = useMemo<InternetIdentityContext>(
    () => ({
      identity,
      login,
      clear,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      loginError,
      registerWithCredentials,
      loginWithCredentials,
    }),
    [
      identity,
      login,
      clear,
      loginStatus,
      loginError,
      registerWithCredentials,
      loginWithCredentials,
    ],
  );

  return createElement(Context.Provider, { value, children });
}

# CareerPath AI

## Current State
The app uses Internet Identity (II) for authentication. The AuthPage shows a single "Sign In / Sign Up" button that opens the II popup. The identity is managed via `useInternetIdentity` hook backed by `AuthClient` from `@dfinity/auth-client`. No username/email/password fields exist.

## Requested Changes (Diff)

### Add
- Sign Up form: username, email, password, confirm password fields with validation
- Sign In form: email, password fields with validation
- Toggle between Sign In and Sign Up modes on the auth page
- Credential-based identity derivation: deterministic Ed25519 keypair derived from email+password via PBKDF2
- Backend `registerAccount(username, email, passwordHash)` function to store user credentials (prevents duplicate email registration)
- Backend `validateLogin(email, passwordHash)` function to verify credentials on sign-in
- `UserCredential` type in backend and `backend.d.ts`
- Credential session persistence in localStorage (identity key stored)

### Modify
- `useInternetIdentity.ts`: Replace AuthClient-based flow with credential-based identity derivation. Keep same interface (identity, clear, loginStatus flags). Add `registerWithCredentials` and `loginWithCredentials` methods to context.
- `AuthPage.tsx`: Replace single II button with two-tab form (Sign In / Sign Up) with full validation
- `backend.d.ts`: Add `UserCredential` interface and new backend functions

### Remove
- Internet Identity popup / AuthClient dependency (no longer the primary auth mechanism)
- Import of II-specific classes from AuthPage

## Implementation Plan
1. Add `UserCredential` type, `credentials` Map, `registerAccount`, `validateLogin` functions to `main.mo`
2. Update `backend.d.ts` to include `UserCredential` and new function signatures
3. Rewrite `useInternetIdentity.ts` to use `Ed25519KeyIdentity` from `@dfinity/identity`, derive identity from credentials, persist identity JSON in localStorage
4. Rewrite `AuthPage.tsx` with Sign In / Sign Up tabs, react-hook-form validation (email regex, min password 8 chars, min username 3 chars, password match), error display, loading states
5. Validate, build, and deploy

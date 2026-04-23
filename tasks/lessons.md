# Lessons

Patterns that came out of corrections or surprising debugging sessions. Read at session start when working on similar areas.

---

## Supabase Edge Functions on the new asymmetric JWT system

**Symptom:** Edge Function returns 401 with no entries in the dashboard logs. Token is verifiably valid (`auth.getUser()` succeeds client-side), session is fresh, headers look right.

**Cause:** Project has migrated to the new API key system (`sb_publishable_...` / `sb_secret_...`). Session JWTs are now ES256 (asymmetric). Functions deployed via Supabase CLI < v2.90 default to `verifyJWT: true` with HS256 verification at the gateway, which rejects the new ES256 tokens before the function runs — hence no logs.

**Fix:** Deploy with `--no-verify-jwt` and validate the user inside the function with a user-scoped client (`createClient(URL, ANON_KEY, { global: { headers: { Authorization } } }).auth.getUser()`). Alternatively, upgrade Supabase CLI to v2.90+.

**Why:** The function's own `getUser()` check is sufficient auth — gateway verify is only an extra hop that breaks during the asymmetric key transition.

**How to apply:** When a Supabase Edge Function returns 401 with empty logs, check the project's anon key format. If `sb_publishable_...`, redeploy with `--no-verify-jwt` (and ensure the function does its own auth check).

---

## Calling Supabase Edge Functions from raw fetch

**Rule:** Send BOTH `Authorization: Bearer <user-jwt>` AND `apikey: <anon-key>` headers, not just Authorization. Without `apikey`, the gateway returns 401 before the function runs.

**Why:** The Supabase gateway requires `apikey` for all REST/Functions calls. `supabase.functions.invoke()` adds it automatically; raw `fetch()` does not.

**How to apply:** When using raw fetch (e.g. needing custom error parsing because `invoke()` returns `data: null` on non-2xx), always include both headers.

---

## React Native: no global `crypto`

**Rule:** Use `expo-crypto` for `randomUUID`, `digestStringAsync`, etc. Do not call `crypto.randomUUID()` — it works in Node and the browser but throws in React Native.

**Why:** RN's global doesn't include the Web Crypto API.

**How to apply:** Search for `crypto.randomUUID` and `crypto.subtle` whenever code is being ported from web/Node. Swap to `expo-crypto`.

---

## Supabase Apple Sign-In nonce

**Rule:** Generate a random `rawNonce`, hash it with SHA-256, send the hash to Apple as the `nonce`, then send the raw value to Supabase as the `nonce` parameter on `signInWithIdToken`.

**Why:** Supabase verifies the Apple id-token by hashing your raw nonce and comparing it to the `nonce` claim inside the signed JWT. If you skip the nonce, the token validates with Apple but Supabase silently rejects it (auth fails with no obvious error).

**How to apply:** Any time `expo-apple-authentication` is wired to Supabase, ensure both nonces are present. See `app/(auth)/login.tsx` for the canonical implementation.

---

## Supabase migration drift on check constraints

**Rule:** When changing an enum/check constraint via a renamed constraint (e.g. `_check` → `_enum`), explicitly DROP the old one. `ADD CONSTRAINT IF NOT EXISTS` only adds; the old constraint silently keeps rejecting writes.

**Why:** Migration 008 added `profiles_chronotype_check` allowing `('early', 'moderate', 'late')`. Migration 013 added `profiles_chronotype_enum` with the same values. Migration 016 replaced `_enum` with the Summis values, but `_check` was never dropped — production writes failed for ~6 weeks. Fixed in 019.

**How to apply:** When replacing an enum/check constraint, write the migration as `DROP CONSTRAINT IF EXISTS old_name; ADD CONSTRAINT new_name ...`. Audit `pg_constraint` after deploys.

---

## EAS build version locked in active App Store submission

**Rule:** When a version is in "Waiting for Review" or "In Review", you cannot swap the build via the normal Build picker — the change appears to save but reverts. Cancel the submission first, then swap, then resubmit.

**Why:** ASC locks the build during review to keep the reviewer's binary stable.

**How to apply:** If the build number doesn't update in the ASC version page, check if a submission is in flight. Cancel it, swap the build, save, and resubmit (notes/attachments persist).

---
slug: building-your-oidc-policy
title: "Building Your Org's OIDC Policy: A Question-Led Guide"
authors: [A-Y-U-S-H-Y-A]
tags: [security, identity, oidc, sso, governance, policy]
date: 2026-09-12T09:00:00.000Z
description: A section-by-section, question-led walkthrough for building your organization's OpenID Connect (OIDC) policy from scratch.
---

Most companies don't have an OIDC problem because nobody understands OpenID Connect. They have one because nobody ever wrote down the *decisions*: which provider, which apps, who owns the credentials, how long a secret should live, what happens when someone forgets to rotate one. The protocol is standardized. Your organization's choices around it are not, until you write them down.

<!-- truncate -->

This guide is built to be answered, not just read. Every section below explains *why* that piece of a policy matters, then hands you a short list of questions. Open a blank Word document next to this post, work through the sections in order, and by the end you'll have a first draft of a real OIDC policy, not a template with the blanks still in it.

## How to use this guide

Keep this post open in one window and Microsoft Word (or your editor of choice) open beside it. For each section:

1. Read the short explainer — it tells you what the section is for and why it matters.
2. Answer the 📝 questions directly in your Word document, under a heading matching the section number and title below (`1. Purpose`, `2. Scope`, and so on).
3. Don't worry about polish on the first pass. A rough answer you can tighten later beats a blank section.

By section 23, your Word document *is* your draft policy mirroring the structure below.

---

## 1. Purpose

Every policy needs a reason to exist, stated plainly enough that someone reading it two years from now, after the person who wrote it has left, still understands why it's there. This section is the "why," in a paragraph or two: what risk or inconsistency this policy is closing, and what "success" looks like once it's followed.

📝 **Answer these:**
- What specific problem is this policy solving (inconsistent OIDC use, past incident, audit finding, new regulatory pressure)?
- What triggered writing this policy now?
- Who is the executive sponsor or owning function (CISO, Head of IAM, Platform Engineering)?

## 2. Scope

Scope draws the line around what this policy governs and — just as importantly — what it doesn't. A policy that tries to cover everything usually ends up enforced nowhere.

📝 **Answer these:**
- Does this apply to workforce (employee) authentication, customer-facing authentication, or both?
- Which environments are covered: production only, or also staging/dev/test, only internal systems, only external ones or both?
- Which business units, subsidiaries, or acquired companies are in scope?
- What's explicitly out of scope (e.g., legacy SAML apps mid-migration, machine-to-machine/service auth, mainframe auth)?

## 3. Definitions

A shared glossary prevents arguments later about what "client" or "criticality" means. Define the standard OIDC/OAuth2 vocabulary once, then add any terms specific to your organization.

📝 **Answer these:**
- Do you need org-specific definitions for terms like "application criticality tier," "internal network," or "approved provider" that will be used later in this policy?
- Are there internal team names or system names (e.g., your IAM platform's internal codename) that need defining for readers outside that team?

*(Standard terms to include as-is: OIDC, OAuth 2.0, Identity Provider (IdP), Relying Party (RP)/Client, Client ID, Client Secret, Access Token, ID Token, Refresh Token, Scopes, Claims, PKCE, JWKS, Discovery Document, Redirect URI.)*

## 4. Approved OIDC Providers & Applicability

This is the *allow-list* of identity providers your organization actually permits — not every provider that exists — **and** where each one is allowed to be used. Naming this explicitly stops individual teams from quietly standing up their own IdP, while mapping providers to application boundaries (internet-only, internal-only, hybrid, cloud/data-centre) ensures an internet-facing customer portal and an internal finance tool don't get the same default despite very different threat models.

📝 **Answer these:**
- Is there a preferred (primary/default) OIDC supplier for the organization?
- Which other providers are approved for specific cases, and why (e.g., a specific vendor for customer-facing apps, another for workforce SSO)?
- Is there a provider that is explicitly *disallowed* and why?
- What application boundary categories exist in your environment (e.g., internet-only, internal-only, internet-facing app connecting to internal services, specific cloud provider, specific data centre)?
- For each boundary category, is there a preferred or mandatory OIDC provider?
- Are there use cases where OIDC is *not* the right fit (e.g., legacy systems, B2B federation, service accounts) and what's used instead?

*(Suggested table to include in your Word doc — copy and adapt to your org):*

| Provider | Status | Intended Use Case / Scope | Justification / Notes |
|---|---|---|---|
| Example: Microsoft Entra ID (Azure AD) | **Primary / Preferred** | Workforce SSO, internal apps, M365-integrated services | Default for all employee-facing auth; covered by existing E5 licensing and conditional access policies |
| Example: Okta (Customer Identity) | **Approved** | Customer-facing web & mobile apps (internet-only) | Required for CIAM use cases needing self-service registration and social federation |
| Example: Auth0 by Okta | **Approved — Conditional** | Legacy customer portal (until Q4 2027 migration) | Grandfathered; no new apps to onboard here — migrate to Okta CIAM |
| Example: Google Identity Platform | **Disallowed** | — | Not approved due to data residency and contractual gaps; exception requires CISO + Legal risk acceptance |
| *Your Provider 1* | Primary / Approved / Disallowed | *e.g., Internal-only apps* | *Why this status* |
| *Your Provider 2* | Primary / Approved / Disallowed | *e.g., Specific business unit or cloud* | *Why this status* |

> Tip: Keep this table as the single source of truth. If a provider isn't on this list, it's not approved — teams must submit a request per section 18 before integrating.

## 5. Application Classification

Not every application deserves the same level of authentication rigor. Defining criticality tiers up front lets every later section (MFA, token lifetime, logging) simply say "per the app's tier" instead of repeating itself.

📝 **Answer these:**
- What criticality tiers will you use (e.g., Critical / High / Standard / Low)?
- What factors determine an app's tier — data sensitivity, user base size, regulatory scope, revenue impact?
- Who assigns and approves an application's tier — the app owner, security team, or both?

## 6. Provider Selection Matrix

Where section 4 names the approved providers, this section turns that list into a decision tool: given an application's boundary type and criticality tier, which provider should a team actually pick, and in what order of preference?

📝 **Answer these:**
- What is the priority order of approved OIDC suppliers (first choice, second choice, fallback)?
- Does the priority order change based on application boundary (internet vs. internal vs. hybrid) or cloud/data-centre placement?
- Is there a documented matrix (boundary type × criticality tier → preferred provider) that teams can self-serve from?

*(Suggested table to include in your Word doc — copy and adapt to your tiers/boundaries from sections 4–5):*

| Boundary Type \ Criticality Tier | **Critical** | **High** | **Standard** | **Low** |
|---|---|---|---|---|
| **Internet-only** (customer-facing, public) | **Okta CIAM (Primary)** — Entra ID not permitted | **Okta CIAM (Primary)** | **Okta CIAM (Primary)** | **Okta CIAM** or Entra ID (if workforce tool) |
| **Internal-only** (corp network / VPN, workforce) | **Entra ID (Primary)** — HSM-backed key req. | **Entra ID (Primary)** | **Entra ID (Primary)** | **Entra ID (Primary)** |
| **Hybrid** (internet-facing app → internal API/service) | **Entra ID (Primary)** + Okta for external users — separate clients | **Entra ID (Primary)** — Okta (Fallback for B2C) | **Entra ID (Preferred)** / Okta (Allowed with approval) | **Either** — per data sensitivity |
| **Cloud / Data-centre specific** *(if applicable)* | *e.g., AWS-hosted Critical → Entra ID* | *e.g., DC2 High → Entra ID* | *e.g., Standard → Entra ID* | *e.g., Low → Entra ID* |

> How to use it: Find your boundary row and criticality column (tiers defined in section 5). The cell tells you the mandatory/expected IdP from section 4. Anything off-matrix requires a documented exception per your exception process. Add or remove rows/columns to match your actual boundaries and tiers — this exact shape is just an example.

## 7. Application Registration

Someone has to actually issue the client ID and secret. If that person or team isn't named, every app team either finds their own workaround or waits indefinitely.

📝 **Answer these:**
- Who is the person, team, or ticketing queue to contact to register a new application and obtain OIDC credentials?
- What information must an app team provide at registration (app name, owner, criticality tier, redirect URIs, environment)?
- Is there a self-service portal, or is this always a manual request?
- What is the expected turnaround time (SLA) for issuing credentials?

## 8. Client ID & Secret Management

Client secrets are effectively passwords for applications, and they're routinely mishandled — checked into source control, shared across environments, left alive for years. This section sets the hard rules.

📝 **Answer these:**
- What is the maximum validity period for a client ID/secret before mandatory rotation (e.g., 90 days, 180 days, 1 year)?
- Is it mandatory to use different client IDs and secrets across different subdomains or environments, and how is that enforced?
- Where must secrets be stored (secrets manager only — no config files, no source control)?
- Who can request a secret rotation, and what's the process if a secret is suspected to be compromised?

## 9. Redirect URI & Origin Requirements

A loosely configured redirect URI is one of the most common ways OIDC integrations get exploited. This section makes the rules for what's allowed explicit rather than left to each developer's judgment.

📝 **Answer these:**
- Are wildcard redirect URIs allowed, or must every URI be registered as an exact match?
- How are redirect URIs handled across subdomains (does each subdomain need its own registered URI)?
- Is HTTPS mandatory for all redirect URIs, including internal apps?
- What's the process to add or change a registered redirect URI after go-live?

## 10. Authentication & MFA Requirements

Not every login needs the same bar. This section ties directly back to the criticality tiers from section 5 — what's actually required (MFA method, adaptive/risk-based signals, network or location restrictions) at each level.

📝 **Answer these:**
- At what criticality tier(s) is MFA mandatory, and which MFA methods are acceptable (authenticator app, hardware key, SMS — and is SMS banned for higher tiers)?
- Are risk-based/adaptive authentication signals required (impossible travel, new device, anomalous behavior patterns)?
- Are there location or network restrictions (e.g., block or step-up MFA for logins outside approved geographies or off-VPN)?
- Do these requirements differ for workforce vs. customer-facing applications?

## 11. OIDC Flow & Protocol Requirements

There are several valid OAuth2/OIDC flows, but not all of them are safe for every client type. This section pins down which flow is mandatory and which are banned outright.

📝 **Answer these:**
- Is Authorization Code flow with PKCE mandatory for all client types, including confidential clients?
- Is the Implicit flow explicitly banned?
- What's required for server-to-server or headless scenarios (Client Credentials flow) — and who can approve its use?
- What minimum OIDC/OAuth2 library or SDK standards must integrations meet (no hand-rolled token validation, for example)?

*(Suggested table to include in your Word doc — copy and adapt to your client types):*

| Client / Communication Type | Preferred OIDC Flow | Status | When to Use / Conditions | Notes / Requirements |
|---|---|---|---|---|
| **Web app with backend** (confidential client) | **Authorization Code + PKCE** | **Mandatory** | All interactive user logins where a server can keep a secret | PKCE required even for confidential clients; use `response_type=code`, validate `nonce`, `iss`, `aud`, `exp` via certified library |
| **Single-Page App (SPA)** — browser | **Authorization Code + PKCE** (no client secret) | **Mandatory** | Public client, JavaScript-only | Must use PKCE with `code_challenge`; no Implicit; refresh via rotation, store tokens in HttpOnly cookie or memory only — never `localStorage` |
| **Native / Mobile app** (iOS, Android, desktop) | **Authorization Code + PKCE** via system browser / AppAuth | **Mandatory** | Public client on device | Use external user-agent (ASWebAuthenticationSession / Custom Tabs), not embedded WebView; PKCE + `state` required |
| **Server-to-server / Service account / Daemon** | **Client Credentials** | **Approved — Conditional** | No user present, backend-to-backend | Requires section 7 registration + security approval; separate `client_id` per env; scope-limited, mTLS or `private_key_jwt` preferred over shared secret |
| **Input-constrained / Device / CLI / Smart TV** | **Device Code** (`urn:ietf:params:oauth:grant-type:device_code`) | **Approved — Conditional** | No browser/keyboard on device | Poll interval enforced; device verification URI shown on secondary device; short `device_code` lifetime; requires IAM team approval |
| **Any client type** | **Implicit Flow** (`response_type=token id_token`) | **Banned** | Never | Returns tokens in URL fragment — leaks via referrer/history; use Authorization Code + PKCE instead |
| **Any client type** | **ROPC / Password Grant** | **Banned** | Never | Collecting passwords directly bypasses MFA/SSO and IdP controls; blocked at IdP policy level |

> Tip: If a flow isn't on the **Mandatory** or **Approved — Conditional** rows, treat it as banned. Conditional flows need an approved use case logged in section 7 and a re-review per section 16.

## 12. Claims, Scopes & Data Handling

The token coming back from your IdP carries user data — and how much of it your application is allowed to persist locally is a real data-governance question, not just a technical one.

📝 **Answer these:**
- What data/claims are available via your approved OIDC provider(s) (e.g., name, email, employee ID, group membership)?
- What data from those claims *can* be stored in an application's local database, and for how long?
- What data must *never* be persisted at the application level and should only ever be read live from the token or IdP (e.g., group membership used for real-time authorization checks)?
- What scopes are apps allowed to request by default, and what requires explicit approval (e.g., broader profile or admin scopes)?

## 13. Token Management

Tokens that live too long, or that get validated incorrectly, quietly become long-term backdoors. This section defines lifetimes and validation rules so every integration behaves the same way.

📝 **Answer these:**
- What are the maximum lifetimes for access tokens, ID tokens, and refresh tokens?
- Is refresh token rotation mandatory?
- Where and how must tokens be stored client-side (e.g., HttpOnly secure cookies vs. local storage — is local storage banned)?
- What signature/audience/issuer validation is mandatory before a token is trusted?

## 14. Session & Logout Management

Login is only half of session security — how a session ends matters just as much, especially across multiple connected applications.

📝 **Answer these:**
- What is the maximum session idle timeout and absolute session lifetime, and does it vary by criticality tier?
- Is single logout (SLO) required across applications sharing the same IdP session?
- Does the policy require front-channel or back-channel logout support from integrated apps?
- What happens to active sessions when a user's account is disabled or offboarded?

## 15. Logging & Monitoring

If an authentication event isn't logged, it didn't happen — at least not in any way you can investigate later. This section defines the minimum audit trail.

📝 **Answer these:**
- Which authentication events must be logged (successful login, failed login, token issuance, token refresh, logout, consent grants)?
- Where do these logs need to flow (central SIEM, specific retention period)?
- Who is alerted on anomalies (repeated failures, impossible travel, spikes in token issuance)?
- What's the minimum log retention period, and does it vary by app criticality or regulatory requirement?

## 16. Vulnerability & Security Testing

OIDC integrations are frequently misconfigured in ways automated scanners miss — this section sets the expectation for how and how often they get tested by a human.

📝 **Answer these:**
- Is a security review or penetration test mandatory before an OIDC integration goes to production?
- How often must integrations be re-tested (annually, on major changes, on criticality-tier basis)?
- Who performs testing — internal security team, external vendor, or both?

## 17. Lifecycle Management

Applications and their credentials aren't set up once and forgotten — they're onboarded, changed, and eventually retired, and each stage needs an owner and a process.

📝 **Answer these:**
- What's the process for decommissioning an application and revoking its OIDC credentials?
- How are orphaned or unused client registrations identified and cleaned up (regular audits)?
- What happens to credentials when an application owner leaves the organization?
- Is there a periodic (e.g., quarterly/annual) review of all registered applications against this policy?

## 18. Third-Party Provider Requirements

When the OIDC provider itself is a vendor, your organization inherits some of its risk. This section sets the bar that vendor has to clear.

📝 **Answer these:**
- What certifications or attestations are required of a third-party OIDC provider (SOC 2, ISO 27001, etc.)?
- What are the contractual breach-notification timelines required?
- What data residency or data processing requirements apply?
- What's the process to evaluate and approve a *new* third-party provider before it's added to section 4's approved list?

## 19. Availability & Business Continuity

If your identity provider goes down, so does every application depending on it — unless you've planned for that.

📝 **Answer these:**
- What availability SLA is required of an approved OIDC provider?
- Is there a fallback authentication mechanism for critical applications if the primary IdP is unavailable, and who approves its use?
- How is an IdP outage detected and escalated?
- Is there a documented business continuity/disaster recovery plan specific to identity services?

## 20. Incident Management

When something goes wrong with authentication — a leaked secret, a compromised account, a misconfigured redirect URI exploited in the wild — the response can't be improvised in the moment.

📝 **Answer these:**
- What qualifies as an OIDC-related security incident that must be formally reported?
- What are the immediate containment steps (e.g., mandatory secret rotation, session invalidation) and who can execute them?
- Who must be notified, and within what timeframe?
- Is there a post-incident review requirement, and who owns it?

## 21. RACI

A policy without named owners is a suggestion. This matrix makes explicit who's Responsible, Accountable, Consulted, and Informed for each major OIDC activity.

📝 **Answer this:**
- Build your RACI matrix. Suggested rows (activities) to start from — adjust to your org:

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Selecting/approving OIDC providers | | | | |
| Registering new applications | | | | |
| Issuing client ID/secret | | | | |
| Rotating client secrets | | | | |
| Approving MFA/criticality exceptions | | | | |
| Monitoring auth logs | | | | |
| Responding to an incident | | | | |
| Reviewing/decommissioning stale apps | | | | |
| Approving policy exceptions | | | | |
| Reviewing this policy annually | | | | |

## 22. Compliance & Review Requirements

Your OIDC policy doesn't exist in isolation — it needs to satisfy whatever regulatory or contractual frameworks your organization is already bound by.

📝 **Answer these:**
- Which regulatory or compliance frameworks apply (GDPR, HIPAA, PCI-DSS, SOC 2, ISO 27001, others)?
- Are there specific clauses in those frameworks that directly constrain OIDC design choices (e.g., data residency, MFA mandates, log retention minimums)?
- Who is responsible for evidencing compliance during an audit?
- How often is a formal compliance review conducted against this policy?

## 23. Policy Review / Version Control

A policy that's never revisited quietly goes stale — new providers emerge, old threats change, and the org itself changes shape. This closing section commits to keeping it current.

📝 **Answer these:**
- Who owns this document and is responsible for keeping it current?
- On what cadence is it formally reviewed (annually, on major security incidents, on major provider changes)?
- Where does the version history live, and what does a version bump require (approval from whom)?

*(Suggested table to include in your Word doc:)*

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 0.1 | | | Initial draft |

---

## What you should have now

If you worked through all 23 sections, your Word document is a first draft of a complete OIDC policy — every section named, every open question either answered or flagged for follow-up with the right stakeholder. The next step is the least exciting but most important one: get it in front of security, legal, and your app owners for review, then set the date for the first version-control entry in section 23.
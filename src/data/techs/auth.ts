import type { Tech } from "../types";

/**
 * Auth approaches. Two different axes hide in this category, and conflating
 * them is the classic mistake: jwt-auth vs session-auth is a TRANSPORT/STATE
 * question (where does the logged-in state live); managed-idp vs
 * self-hosted-idp is a BUILD-VS-BUY question (who operates the identity
 * domain). And "never build your own auth" really means "never build your own
 * crypto or password storage" — the real decision is where identity lives and
 * who runs it.
 */
export const AUTH_TECHS: Tech[] = [
  {
    id: "jwt-auth",
    aka: ["JSON Web Tokens", "bearer tokens", "token auth"],
    name: "Stateless JWT",
    category: "auth",
    tagline: "Identity in a signed token — scales without shared state, and makes logout everyone's hardest feature.",
    description:
      "The client holds a signed token asserting who they are and what they may do; any server with the verification key can check it without a database lookup or shared session store. That statelessness is why it dominates APIs, microservices, and mobile backends. The honest cost is revocation: a stolen or logged-out token stays valid until it expires, so every serious deployment converges on the same mitigation — short-lived access tokens plus refresh-token rotation — which quietly reintroduces the server-side state you were avoiding.",
    scores: {
      performance: 8,
      devVelocity: 6,
      learningEase: 5,
      ecosystem: 8,
      scalability: 9,
      typeSafety: 5,
      opsSimplicity: 7,
      maturity: 8,
    },
    scoreNotes: {
      learningEase:
        "Reading a tutorial takes an hour; the curve is the sharp edges — algorithm confusion attacks, storage (localStorage vs cookies), expiry/refresh choreography, clock skew.",
      devVelocity:
        "Verifying a token is trivial; building the full lifecycle (refresh rotation, revocation lists, key rotation) is the part every team underestimates.",
      typeSafety:
        "Claims are just JSON — nothing checks that the 'role' claim your middleware reads is the one the issuer wrote. Typed claim contracts are team discipline.",
    },
    strengths: [
      "No shared session store: any instance, any service, any region can verify a request independently",
      "Crosses service boundaries naturally — one token authenticates against your whole API surface, ideal for microservices and mobile clients",
      "Claims travel with the token: roles and tenant IDs are available without a user-database round trip",
      "It's the lingua franca — every IdP issues them, every framework middleware verifies them",
    ],
    weaknesses: [
      "Revocation is the structural flaw: logout, permission changes, and stolen tokens all wait for expiry unless you add server-side state back",
      "The mitigation everyone reinvents — short-lived access tokens + refresh rotation — is real complexity that tutorials skip",
      "Token storage in browsers is a minefield: localStorage is XSS-readable, cookies reintroduce CSRF concerns",
      "Fat tokens ride on every request, and stale claims (yesterday's role) are trusted until expiry",
    ],
    chooseWhen: [
      "Multiple services or APIs must authenticate requests without a shared session dependency",
      "Mobile apps and third-party API consumers — cookie sessions don't fit non-browser clients",
      "You're consuming tokens from an IdP anyway — verifying its JWTs is the natural integration",
    ],
    avoidWhen: [
      "A single server-rendered app — cookie sessions are simpler, revocable, and have fewer sharp edges",
      "Instant revocation is a hard requirement (banking, admin consoles) and you're not prepared to build the denylist machinery that undermines the statelessness",
    ],
    alternatives: [
      {
        techId: "session-auth",
        note: "For a single browser-facing app, sessions give instant revocation and fewer footguns — statelessness you don't need is complexity you don't need.",
        effort: "moderate",
      },
      {
        techId: "managed-idp",
        note: "Not a swap but a completion: let a provider own issuance, MFA, and refresh choreography while your services just verify the JWTs.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "microservices", note: "Stateless verification at every service is the property that makes distributed auth tractable." },
      { techId: "grpc", note: "Tokens in request metadata authenticate service-to-service calls with no session infrastructure." },
      { techId: "rest", note: "Bearer tokens in the Authorization header — the default auth story for every API client and gateway." },
    ],
    frictionWith: [
      { techId: "htmx", note: "A server-rendered hypermedia app has a server right there — bolting token lifecycle onto it instead of a session cookie is machinery without a payoff." },
    ],
    notInterchangeableWith: [
      {
        techId: "managed-idp",
        note: "'We use JWT' and 'we use Auth0/Entra' answer different questions. JWT is a token format; an IdP is the system that authenticates users and ISSUES those tokens. Choosing JWT tells you nothing about who verifies passwords, runs MFA, or handles resets — you still owe that answer.",
      },
    ],
    commitments: [
      {
        need: "You now need a token revocation story before the first compromised account",
        why: "A stateless token can't be recalled; short TTLs plus refresh rotation is the standard answer, and someone must build it.",
      },
      {
        need: "You now own signing-key custody and rotation",
        why: "A leaked key forges everyone's identity, and rotating without invalidating every live session takes key IDs and overlap windows — machinery that must exist before the incident, not after.",
      },
      {
        need: "You now own token-storage guidance for every client type",
        why: "localStorage is XSS-readable, cookies reintroduce CSRF, mobile has its own keychain rules — each client platform needs a documented, enforced answer, forever.",
      },
    ],
    tags: ["stateless", "tokens", "api-auth"],
  },
  {
    id: "session-auth",
    aka: ["cookie auth", "server-side sessions"],
    name: "Cookie Sessions",
    category: "auth",
    tagline: "The boring right answer for server-rendered apps — state on the server, a random ID in a cookie, logout that actually works.",
    description:
      "The browser holds an opaque session ID in a cookie; the server holds everything else. Every request looks up the session, which means revocation is a delete: logout, ban, and permission changes take effect on the next request. It carries a legacy-tech reputation it doesn't deserve — for a single server-rendered application it remains the simplest, most secure default. Its genuine constraint is horizontal scale: multiple instances need a shared session store, and non-browser clients don't fit the model.",
    scores: {
      performance: 6,
      devVelocity: 8,
      learningEase: 8,
      ecosystem: 8,
      scalability: 5,
      typeSafety: 4,
      opsSimplicity: 8,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "A session lookup per request — usually a sub-millisecond Redis hit. Real but rarely the bottleneck anyone claims it is.",
      scalability:
        "Scales fine behind a load balancer WITH a shared session store; the '5' reflects that dependency plus the poor fit for multi-service and non-browser clients.",
      opsSimplicity:
        "Framework middleware plus a session store you likely already run — decades of paved path.",
    },
    strengths: [
      "Instant revocation: logout, ban, and role changes are a server-side delete, effective immediately — the feature JWT architectures sweat to approximate",
      "The browser does the hard part: HttpOnly, Secure, SameSite cookies are XSS-resistant storage with automatic sending",
      "Every mature web framework ships it as the paved path — middleware, store adapters, CSRF protection included",
      "Nothing sensitive leaves the server; the cookie is a random handle, not a claims payload to leak or tamper with",
    ],
    weaknesses: [
      "Horizontal scaling requires a shared session store (Redis, database) or sticky sessions — the state has to live somewhere",
      "Wrong shape for non-browser clients: mobile apps and third-party API consumers don't want your cookie jar",
      "Cross-domain and multi-service setups fight cookie scoping rules — sessions assume one app, one domain",
      "CSRF protection is mandatory homework (SameSite helps, but you must know why)",
    ],
    chooseWhen: [
      "A single server-rendered application — this is the right boring answer, not the legacy one",
      "Instant revocation matters: admin panels, internal LOB apps, anything with 'disable this account now' requirements",
      "The team wants the paved path: framework session middleware has decades of hardening behind it",
    ],
    avoidWhen: [
      "The consumers are mobile apps or third-party API clients — tokens are the right shape there",
      "Many services must authenticate requests independently — shipping one app's session store to every service recreates the problem tokens solve",
    ],
    alternatives: [
      {
        techId: "jwt-auth",
        note: "Switch when the architecture goes multi-service or the clients stop being browsers — that's when statelessness starts paying for its complexity.",
        effort: "moderate",
      },
      {
        techId: "managed-idp",
        note: "Orthogonal, not competing: an IdP can authenticate the user while your app still keeps a plain session cookie afterward — a common and underrated combination.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "htmx", note: "Server-rendered pages and cookie sessions are the classic, simplest-possible pairing — the browser handles everything." },
      { techId: "redis", note: "The default shared session store — sub-millisecond lookups and TTLs that expire sessions for free." },
      { techId: "monolith", note: "One app, one domain, one session store — the model's assumptions all hold." },
    ],
    frictionWith: [
      { techId: "microservices", note: "Server-held sessions fight horizontal, polyglot services — every service needs the store, and cookie scoping fights service topology." },
    ],
    notInterchangeableWith: [
      {
        techId: "jwt-auth",
        note: "Not old-vs-new — a different placement of state. Sessions keep state on the server and get instant revocation; JWTs push state to the client and get horizontal freedom. 'JWT because it's modern' trades away revocation for a scaling property single-app systems don't need.",
      },
    ],
    commitments: [
      {
        need: "You now run the session store as login-critical infrastructure",
        why: "The moment a second instance exists, Redis or the session table IS authentication — its outage logs everyone out, so it inherits your app's availability target.",
      },
      {
        need: "You now own CSRF defenses as permanent homework",
        why: "Cookies are sent automatically, which is the convenience and the attack; SameSite covers most of it, but every state-changing endpoint stays in scope for review, forever.",
      },
      {
        need: "You now own session lifecycle policy",
        why: "Idle timeouts, absolute lifetimes, concurrent-session limits, and ID regeneration on login are decisions nobody made in the tutorial — and auditors will ask for all of them.",
      },
    ],
    tags: ["default-choice", "server-state", "browser"],
  },
  {
    id: "managed-idp",
    aka: ["Entra ID (Azure AD)", "Auth0", "Cognito", "Okta", "Clerk"],
    name: "Managed Identity Provider",
    category: "auth",
    tagline: "Entra ID, Auth0, Cognito — buy the entire identity domain, and read the per-user pricing page twice.",
    description:
      "Outsource identity wholesale to a hosted provider: password storage, MFA, SSO federation, password reset, breached-credential detection, anomaly detection, and the compliance paperwork all become someone else's product. Your app redirects to their login, gets back signed tokens, and never touches a password. This is the strongest form of 'never build your own auth' — and its costs are strategic rather than technical: per-user pricing that cliffs precisely when you succeed, and a vendor now standing in your login path.",
    scores: {
      performance: 6,
      devVelocity: 9,
      learningEase: 6,
      ecosystem: 9,
      scalability: 10,
      typeSafety: 6,
      opsSimplicity: 9,
      maturity: 9,
    },
    scoreNotes: {
      devVelocity:
        "Login, MFA, reset flows, and SSO on day one instead of quarter three — the biggest velocity purchase in this category.",
      learningEase:
        "Integration is easy; the curve is OIDC/OAuth vocabulary (flows, scopes, audiences) plus each provider's own console, quirks, and rule engines.",
      typeSafety:
        "OIDC gives you discovery documents and well-known claim shapes — more machine-checkable contract than hand-rolled auth, less than a compiler.",
      opsSimplicity:
        "You operate nothing — but when the provider has an outage, nobody can log in and your status page just points at theirs.",
    },
    strengths: [
      "The whole identity checklist is a product: MFA, SSO/SAML federation, passwordless, breach detection, reset flows — features that take teams years to build well",
      "Compliance leverage: the provider's SOC 2/ISO certifications cover the identity slice of your audit",
      "Enterprise SSO support (the 'log in with our Entra ID' deal-closer for B2B sales) comes largely ready-made",
      "Security patches for the scariest part of your system ship on the vendor's schedule, not your backlog's",
      "Scales from ten users to millions with zero identity-infrastructure work",
    ],
    weaknesses: [
      "Per-user (MAU) pricing cliffs: costs that round to zero at 1k users become a budget line at 50k and a negotiation at 500k — success is the trigger",
      "Vendor dependency in the most critical path: their outage is your outage, their deprecation is your migration",
      "Customization walls: login UX, token claims, and user data models bend only as far as the provider allows",
      "User data lives in their cloud — data-residency and sovereignty requirements can veto this outright",
    ],
    chooseWhen: [
      "Almost always, honestly — for most teams the identity domain is undifferentiated heavy lifting with catastrophic downside for mistakes",
      "B2B products where enterprise SSO federation is a sales requirement",
      "Compliance-sensitive domains where the provider's certifications shortcut your audit story",
    ],
    avoidWhen: [
      "Data sovereignty or residency rules forbid identity data in a third-party cloud",
      "Your user count makes MAU pricing structurally absurd (huge consumer products, IoT fleets)",
      "You need deep customization of identity flows that the provider's extension points can't express",
    ],
    alternatives: [
      {
        techId: "self-hosted-idp",
        note: "Same protocols, opposite ownership: escape MAU pricing and keep data sovereignty by operating the identity service yourself.",
        effort: "moderate",
      },
      {
        techId: "session-auth",
        note: "A single internal app with simple needs can skip the IdP entirely — framework sessions plus solid password hashing is legitimate at small scale.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "jwt-auth", note: "The IdP issues, your services verify — this is the intended division of labor behind most JWT architectures." },
      { techId: "serverless-arch", note: "Teams that buy their compute as a service usually should buy identity as a service too — same no-ops philosophy." },
      { techId: "azure-service-bus", note: "In Azure shops, Entra ID's managed identities extend past user login into service-to-service auth across the estate." },
    ],
    notInterchangeableWith: [
      {
        techId: "jwt-auth",
        note: "A provider versus a token format. The IdP authenticates humans, stores credentials, runs MFA, and ISSUES JWTs; 'JWT auth' is how your services consume the result. Teams saying 'we don't need Auth0, we use JWT' have confused the receipt for the store.",
      },
    ],
    commitments: [
      {
        need: "You now manage a vendor relationship in your most critical path",
        why: "Their outages, deprecation notices, and breaking SDK migrations arrive on their schedule — someone must read the changelog, test the upgrades, and own the renewal negotiation.",
      },
      {
        need: "You now track MAU cost as a growth metric, not a footnote",
        why: "Per-user pricing cliffs exactly when the product succeeds — if nobody models the 10x-users invoice before signing, the migration conversation happens under duress.",
      },
      {
        need: "You now treat tenant configuration as code",
        why: "Rules, claim mappings, and console settings ARE your auth behavior; left as click-ops they become unversioned, unreviewable production config that one admin understands.",
      },
      {
        need: "You now keep OIDC expertise in-house anyway",
        why: "Outsourcing identity doesn't outsource understanding it — flows, scopes, audiences, and the provider's quirks still need a resident expert when login breaks at 9 AM Monday.",
      },
    ],
    tags: ["buy-not-build", "oidc", "managed"],
  },
  {
    id: "self-hosted-idp",
    aka: ["Keycloak", "IdentityServer", "Ory"],
    name: "Self-Hosted IdP",
    category: "auth",
    tagline: "Keycloak, IdentityServer — own your identity infrastructure: full control, full sovereignty, and a security-critical service on your pager.",
    description:
      "Run the identity provider yourself: Keycloak, IdentityServer, and their kin speak the same OIDC/OAuth protocols as the hosted vendors, on your infrastructure, with your data, at no per-user cost. This is still 'don't build your own auth' — the crypto, flows, and password storage come battle-tested in the product. What you take on instead is operating it: you now run a security-critical, internet-facing service whose patches cannot wait for the next sprint and whose downtime locks every user out of everything.",
    scores: {
      performance: 6,
      devVelocity: 4,
      learningEase: 3,
      ecosystem: 6,
      scalability: 7,
      typeSafety: 6,
      opsSimplicity: 2,
      maturity: 8,
    },
    scoreNotes: {
      opsSimplicity:
        "The '2' is deliberate: HA deployment, backups, upgrade testing, and drop-everything CVE patching for the service that gates every login. An experienced platform team makes this routine; without one it's reckless.",
      devVelocity:
        "Realm/client configuration, theme customization, and upgrade churn are a standing tax — the '4' is honest for teams to whom this is new.",
      learningEase:
        "You must learn OIDC/OAuth like an implementer, not an integrator — plus the product's own realm/client/mapper model. This is a specialty, not a sprint task.",
      scalability:
        "The software clusters fine; the score reflects that scaling it is now your capacity planning rather than a vendor invoice.",
    },
    strengths: [
      "Zero per-user pricing: the 500k-user MAU invoice that haunts managed IdPs simply doesn't exist",
      "Full data sovereignty: credentials and identity data stay on your infrastructure — the answer for regulated and government environments",
      "Every customization wall disappears: login flows, token contents, federation logic, storage — all yours to shape",
      "Standard OIDC/OAuth means apps integrate exactly as they would with a hosted provider — and can migrate between them",
      "The hard cryptography and protocol flows are battle-tested product code, not your team's first attempt",
    ],
    weaknesses: [
      "You now operate a security-critical service: a Keycloak CVE is a drop-everything event, forever",
      "It's a single point of failure for every application behind it — HA is mandatory, not optional",
      "Real operational expertise required: clustering, session replication, upgrade paths, database care",
      "Total cost is frequently underestimated — the license is free, the platform engineers running it are not",
    ],
    chooseWhen: [
      "Data sovereignty, residency, or air-gapped requirements rule hosted providers out — often the deciding factor by itself",
      "User volume makes MAU pricing structurally worse than dedicating platform engineers to identity",
      "You need identity-flow customization beyond what any vendor's extension points allow",
    ],
    avoidWhen: [
      "There's no platform/ops team to own it — an unpatched, unmonitored IdP is worse than any vendor dependency",
      "A small product team just needs login to work — the operational tax will eat feature velocity for no differentiating benefit",
    ],
    alternatives: [
      {
        techId: "managed-idp",
        note: "Same protocols, no pager: the default unless sovereignty, scale economics, or customization genuinely forces self-hosting.",
        effort: "moderate",
      },
      {
        techId: "session-auth",
        note: "If you're self-hosting an IdP just to serve one application, framework sessions may be the honest answer — an IdP earns its keep across many apps.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "jwt-auth", note: "Identical division of labor to the managed case: your IdP issues the tokens, your services verify them." },
      { techId: "kubernetes", note: "Teams already operating K8s have the HA, upgrade, and monitoring muscles a self-hosted IdP demands — it slots into the estate." },
      { techId: "postgres", note: "Keycloak-class products need a boring, well-backed-up relational store underneath — this is it." },
    ],
    notInterchangeableWith: [
      {
        techId: "managed-idp",
        note: "Same protocols, different question: not 'which product' but 'who operates the security-critical service'. Choosing between them on features misses it — you're choosing between a vendor bill and an operational responsibility that never ends.",
      },
    ],
    commitments: [
      {
        need: "You now patch a security-critical service on someone else's schedule",
        why: "An IdP CVE is a drop-everything event — deferral is not an option like it is for app dependencies.",
      },
      {
        need: "You now run high availability for the door to everything",
        why: "IdP downtime locks every user out of every app behind it — clustering, session replication, and rehearsed failover are entry stakes, not maturity goals.",
      },
      {
        need: "You now staff and retain a niche specialty",
        why: "Realm models, upgrade paths, and clustering quirks are a discipline of their own — when the one engineer who knows your Keycloak leaves, the risk walks out with them.",
      },
      {
        need: "You now guard the credential database like the crown jewels it is",
        why: "Backups, restore drills, and encryption for the identity store are yours — losing it means every user resets, and leaking it is the company-ending headline.",
      },
    ],
    tags: ["sovereignty", "oidc", "self-operated"],
  },
];

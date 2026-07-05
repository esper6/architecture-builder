import type { Tech } from "../types";

/**
 * Hosting models. The axis in this category is control versus operational
 * surrender: at one end you own the OS, at the other you upload files and a
 * CDN does the rest. The recurring lesson is that "we run containers"
 * describes both Kubernetes and a container PaaS while distinguishing
 * nothing — who OPERATES the platform is the real question.
 */
export const HOSTING_TECHS: Tech[] = [
  {
    id: "vms",
    name: "Virtual Machines",
    category: "hosting",
    tagline: "SSH, systemd, and full control — the honest baseline whose hidden costs are patching, drift, and pet servers.",
    description:
      "A rented computer: you get root, an OS, and total freedom — any daemon, any network topology, any weird legacy dependency runs here. Every other hosting model is a set of restrictions traded against operational relief, which makes the VM the baseline all of them should be judged against. The costs don't show up on the invoice: OS patching, configuration drift, and the slow accretion of snowflake servers nobody dares rebuild.",
    scores: {
      performance: 8,
      devVelocity: 4,
      learningEase: 6,
      ecosystem: 9,
      scalability: 5,
      typeSafety: 2,
      opsSimplicity: 3,
      maturity: 10,
    },
    scoreNotes: {
      performance:
        "No platform overhead, no cold starts, hardware tuned to the workload — the ceiling is whatever you're willing to administer.",
      typeSafety:
        "Server state is shell scripts and hand-edits nothing verifies — IaC and immutable images claw this back, but that's tooling you now own.",
      learningEase:
        "Everyone knows how to SSH in and start a process; knowing how to run a patched, monitored, rebuildable fleet is the actual skill, and it's rarer than it looks.",
      scalability:
        "Autoscaling groups exist, but images, health checks, and capacity planning are your project — elasticity is assembled, not included.",
    },
    strengths: [
      "Total control: any OS, daemon, kernel module, or network layout — nothing is off the menu",
      "Runs anything, including the legacy app with the weird license dongle that no PaaS will ever host",
      "Predictable flat pricing, and the cheapest raw compute per dollar at steady load",
      "No platform abstractions between you and a problem — debugging is SSH and standard Unix tools",
      "Universally understood: decades of documentation, and every ops hire has done it",
    ],
    weaknesses: [
      "You own the OS: patching, hardening, certificate renewal, log rotation — forever, on every box",
      "Configuration drift: hand-touched servers diverge until 'works on server A' is a real sentence said in an incident",
      "Snowflake risk: the server nobody can rebuild becomes the server nobody may touch",
      "Everything a PaaS includes — deploys, TLS, autoscaling, health-based restarts — is a project you build yourself",
    ],
    chooseWhen: [
      "The workload genuinely needs OS-level control: custom daemons, exotic networking, kernel tuning, license-bound software",
      "Steady, predictable load where reserved-instance economics beat elastic pricing",
      "Lift-and-shift of existing systems that assume a full machine — moving them twice is worse than hosting them honestly once",
    ],
    avoidWhen: [
      "A standard web app or API with no special OS needs — a container PaaS deletes most of this operational surface for similar money",
      "A small team with no ops discipline or IaC habits — drift and unpatched boxes arrive quickly and quietly",
    ],
    alternatives: [
      {
        techId: "paas-containers",
        note: "If the app fits in a container with no daemon or networking exotica, this trades control you weren't using for operations you no longer do.",
        effort: "moderate",
      },
      {
        techId: "kubernetes",
        note: "When you're running a whole fleet of services on VMs and have rebuilt half an orchestrator in shell scripts — the real thing exists.",
        effort: "moderate",
      },
      {
        techId: "serverless-functions",
        note: "For spiky or event-shaped workloads, an idle VM is money on fire — per-use billing fits the shape.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "monolith", note: "One well-tended VM (or a small load-balanced pair) runs a monolith for years — the classic boring stack." },
      { techId: "postgres", note: "Self-managing a database is the canonical 'I need a real machine' workload — disks, tuning, and backups under your control." },
    ],
    commitments: [
      {
        need: "You now own a patching cadence, forever, on every box",
        why: "OS updates, CVE responses, and certificate renewals never stop — an unpatched fleet doesn't announce itself; it just quietly becomes the audit finding or the breach.",
      },
      {
        need: "You now need IaC and image discipline before drift arrives",
        why: "Rebuildability is a practice, not a default — every hand-edit on a live server is a debt entry, and the snowflake you can't recreate is already forming.",
      },
      {
        need: "You now build and maintain the deploy machinery a PaaS includes",
        why: "Zero-downtime deploys, health-based restarts, TLS automation, and rollbacks are engineering projects here — and each one keeps needing an owner after it ships.",
      },
      {
        need: "You now do capacity planning ahead of demand",
        why: "Nothing scales unless you built the scaling — sizing, autoscaling groups, and headroom for the traffic spike are decisions made in advance or incidents managed live.",
      },
    ],
    tags: ["baseline", "full-control", "iaas"],
  },
  {
    id: "paas-containers",
    name: "Container PaaS",
    category: "hosting",
    tagline: "Give us a container, we run it — the sweet spot that deletes ops work most teams never wanted to own.",
    description:
      "App Service, Cloud Run, Fly.io, ECS/Fargate: you hand the platform a container image and it handles deploys, TLS, load balancing, health checks, restarts, and scaling — as configuration, not projects. For the standard web app or API this is the sweet spot of the category, and the default most teams should argue from. What you give up is the edges: no host daemons, no exotic networking, and the platform's opinions about ports, startup time, and statelessness are now your constraints.",
    scores: {
      performance: 7,
      devVelocity: 9,
      learningEase: 8,
      ecosystem: 8,
      scalability: 8,
      typeSafety: 4,
      opsSimplicity: 9,
      maturity: 8,
    },
    scoreNotes: {
      devVelocity:
        "Push image, get URL: the deploy pipeline that took a VM estate a quarter to build is the Tuesday-afternoon starting point here.",
      opsSimplicity:
        "TLS, restarts, scaling, and zero-downtime deploys are checkbox configuration. What's left is app-level monitoring — the part you'd want to keep anyway.",
      typeSafety:
        "Container images pin the runtime environment reproducibly; the platform config around them is loosely-validated YAML and console clicks.",
      scalability:
        "Horizontal scaling as a slider covers the vast majority of real products; the ceiling is platform limits and multi-service orchestration sophistication.",
    },
    strengths: [
      "Deploys, TLS certificates, health-based restarts, and autoscaling are configuration, not engineering projects",
      "The container contract keeps you portable: the same image runs on any of these platforms — or on Kubernetes later",
      "No OS to patch, no host to harden — the platform's security team works for you",
      "Scale-to-zero and per-second billing on the modern entries (Cloud Run, Fly.io) suit spiky and small workloads",
      "A small team gets big-company operational polish without a platform engineer",
    ],
    weaknesses: [
      "No daemon access or host control: sidecar-ish needs, background agents, and exotic networking hit the platform's walls",
      "Platform opinions bind you: request timeouts, startup deadlines, ephemeral disks — apps must fit the shape",
      "Per-compute pricing exceeds raw VMs at sustained heavy load — convenience has a margin",
      "Each platform's config dialect differs, so the operational knowledge (not the container) is what locks in",
    ],
    chooseWhen: [
      "A standard web app, API, or worker in a container — this is the default that must be argued out of, not into",
      "The team is application developers with no appetite for owning infrastructure",
      "You run one-to-a-handful of services — the K8s conversation starts well above that",
    ],
    avoidWhen: [
      "The workload needs host access, privileged containers, or network topology the platform can't express",
      "Dozens of services with complex inter-service needs — you'll fight the platform's simplicity; that's the honest K8s threshold",
      "Sustained max-utilization compute where VM economics clearly win",
    ],
    alternatives: [
      {
        techId: "vms",
        note: "Drop down when you need the OS — or when steady-state economics at scale justify taking the patching burden back.",
        effort: "moderate",
      },
      {
        techId: "kubernetes",
        note: "Graduate when service count and team count make orchestration-as-a-product worth operating — not because K8s is 'more professional'.",
        effort: "moderate",
      },
      {
        techId: "serverless-functions",
        note: "For event-shaped, bursty work, functions bill closer to actual use than even scale-to-zero containers.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "monolith", note: "A single container on a PaaS is the lowest-friction way to run one deployable — the whole ops story is a config file." },
      { techId: "modular-monolith", note: "Same virtue: one image, one deploy pipeline, however many modules inside." },
      { techId: "postgres", note: "Managed Postgres next to a managed container platform: the entire stack becomes someone else's pager." },
    ],
    notInterchangeableWith: [
      {
        techId: "kubernetes",
        note: "'We run containers' describes both and distinguishes nothing. A PaaS is a service that operates the platform for you; Kubernetes is a platform you operate. Same container image, completely different second job.",
      },
    ],
    commitments: [
      {
        need: "You now own an image pipeline: base images, CVE scanning, registry hygiene",
        why: "The platform patches its hosts, not your containers — a stale base image is your vulnerability, and 'rebuild and redeploy everything monthly' is a process someone must run.",
      },
      {
        need: "You now keep every app twelve-factor clean, permanently",
        why: "Ephemeral disks and restart-at-will are the platform's contract — the first engineer who writes to local disk or holds state in memory breaks it, so statelessness is a standing code-review concern.",
      },
      {
        need: "You now watch the convenience margin as load grows",
        why: "Per-compute pricing crosses VM economics at sustained utilization — someone must know where that line is for your workload, or the platform decides your infrastructure budget.",
      },
    ],
    tags: ["sweet-spot", "managed", "containers"],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "hosting",
    tagline: "The datacenter API — declarative orchestration for fleets of services, and pure overhead below that scale.",
    description:
      "A declarative orchestration platform: you describe desired state — services, replicas, networking, config — and controllers reconcile reality toward it, across many services and many teams, on any cloud. It has become the industry's standard datacenter API, with an ecosystem to match. The honest threshold: it solves problems you only have with many deployables and multiple teams — below that, every one of its concepts is overhead with no offsetting benefit. Managed offerings (EKS, AKS, GKE) take the control plane off your hands; the platform-engineering job remains yours.",
    scores: {
      performance: 7,
      devVelocity: 3,
      learningEase: 2,
      ecosystem: 10,
      scalability: 10,
      typeSafety: 5,
      opsSimplicity: 2,
      maturity: 8,
    },
    scoreNotes: {
      opsSimplicity:
        "The '2' is a team adopting K8s cold: cluster upgrades, networking, RBAC, ingress, observability — a platform-engineering job. An org with a real platform team flips this toward an 8 for the product teams it serves.",
      devVelocity:
        "The '3' is the adoption tax — YAML, controllers, debugging pod networking. On a mature internal platform, product teams deploy with a manifest and velocity is excellent; that platform is the price.",
      learningEase:
        "Pods, services, ingress, RBAC, operators, and the failure modes between them — competence is measured in months, mastery in years.",
      typeSafety:
        "Manifests are schema-validated against typed APIs before apply — more pre-runtime checking than the rest of the category, buried in a lot of YAML.",
    },
    strengths: [
      "Declarative reconciliation: describe desired state, and the platform continuously repairs toward it — self-healing as a substrate",
      "One operational model for many services and teams: namespaces, RBAC, quotas, and rolling deploys as a shared vocabulary",
      "The largest infrastructure ecosystem in existence — operators, Helm charts, and tooling for anything you can name",
      "Genuinely portable across clouds and on-prem — the closest thing to a vendor-neutral datacenter API",
      "Hiring and knowledge leverage: it's the standard, and answers to any failure mode already exist online",
    ],
    weaknesses: [
      "Pure overhead below its threshold: few services, one team — every concept costs and nothing pays",
      "Even managed K8s leaves you the platform job: upgrades, ingress, secrets, observability, cost management",
      "YAML sprawl and tooling layers (Helm, kustomize, GitOps) each solve a problem and add a layer",
      "The complexity attracts résumé-driven adoption more than any other tech in this catalog",
    ],
    chooseWhen: [
      "Many deployables and multiple teams need a shared, self-service deployment platform — the problem K8s actually solves",
      "You have (or are funding) platform engineering to own the cluster as a product for internal teams",
      "Portability across clouds or to on-prem is a genuine requirement with money behind it",
    ],
    avoidWhen: [
      "You run one-to-a-handful of services — a container PaaS delivers the same outcome minus the platform job",
      "Nobody owns the platform: a cluster adopted by a product team 'on the side' becomes the least-maintained critical system you have",
      "It's being chosen because serious companies use it — that's the org chart cosplaying, not architecture",
    ],
    alternatives: [
      {
        techId: "paas-containers",
        note: "The honest answer below the many-services threshold — same containers, none of the platform ownership.",
        effort: "moderate",
      },
      {
        techId: "vms",
        note: "A small static fleet without orchestration needs can live on plain VMs with simpler failure modes.",
        effort: "moderate",
      },
      {
        techId: "serverless-functions",
        note: "For event-driven workloads, functions skip the cluster entirely — no nodes, no scheduling, no YAML.",
        effort: "rewrite",
      },
    ],
    pairsWellWith: [
      { techId: "microservices", note: "K8s exists for exactly this: orchestrating many small deployables with service discovery, health checks, and rolling deploys." },
      { techId: "nats", note: "A lightweight clustered messaging layer that deploys into the estate as easily as any other pod." },
      { techId: "grpc", note: "Dense east-west service traffic inside a cluster is gRPC's natural habitat." },
    ],
    frictionWith: [
      { techId: "monolith", note: "Running one deployable on a full K8s cluster is renting a container ship to move a couch." },
    ],
    notInterchangeableWith: [
      {
        techId: "paas-containers",
        note: "An orchestration platform you operate versus a service that operates it for you. Both 'run containers'; only one gives your team a second job. Comparing them on features misses the real line item: platform ownership.",
      },
    ],
    commitments: [
      {
        need: "You now own YAML sprawl governance",
        why: "Manifests, Helm charts, and operators multiply; without conventions the cluster config becomes its own legacy codebase.",
      },
      {
        need: "You now upgrade clusters on Kubernetes' release clock, not yours",
        why: "Versions fall out of support fast and API deprecations break live manifests — skipping upgrades isn't deferral, it's compounding a forced migration.",
      },
      {
        need: "You now fund platform engineering as a standing function",
        why: "The cluster is an internal product: it needs owners, on-call, a roadmap, and paved-road docs — a K8s estate maintained 'on the side' is the least-tended critical system you have.",
      },
      {
        need: "You now actively manage cluster cost",
        why: "Requests, limits, bin-packing, and idle-node headroom decide the bill — an untuned cluster quietly costs multiples of the workloads it runs.",
      },
    ],
    tags: ["orchestration", "platform", "fleet-scale"],
  },
  {
    id: "serverless-functions",
    name: "Serverless Functions",
    category: "hosting",
    tagline: "Lambda, Azure Functions — code that exists only while running: per-use billing, cold starts, and a platform-shaped design.",
    description:
      "The hosting substrate of serverless architecture: you upload a function, the platform runs an instance per event and bills per invocation — no process to keep alive, no capacity to plan, scale-to-zero for free. Code becomes event-shaped by necessity: stateless, short-lived, triggered by HTTP, queues, timers, or storage events. The constraints are the contract: cold starts on quiet paths, execution time and memory limits, and a design that gradually molds itself to the vendor's event model.",
    scores: {
      performance: 4,
      devVelocity: 7,
      learningEase: 6,
      ecosystem: 8,
      scalability: 10,
      typeSafety: 3,
      opsSimplicity: 8,
      maturity: 8,
    },
    scoreNotes: {
      performance:
        "Cold starts and per-invocation overhead hurt latency-sensitive paths; warm and steady it's fine, but the worst case is the platform's to choose, not yours.",
      opsSimplicity:
        "No servers, no patching, no capacity planning — but debugging across function boundaries and managed-service consoles is its own discipline.",
      typeSafety:
        "Event payloads are untyped JSON shaped by vendor conventions — the trigger contract between services is checked by nothing until runtime.",
      scalability:
        "Zero to thousands of concurrent executions with no action from you — elasticity is the product.",
    },
    strengths: [
      "True pay-per-use: zero traffic costs zero — unbeatable for spiky, scheduled, and low-volume workloads",
      "Scaling is the platform's problem, from nothing to a stampede, with no capacity planning",
      "No process babysitting: nothing to patch, restart, or keep alive at 2 AM",
      "Event-source integrations (queues, storage, timers, streams) make glue code nearly declarative",
      "Forces small, stateless units — decent architectural hygiene imposed by the substrate",
    ],
    weaknesses: [
      "Cold starts on infrequently-hit paths — worse with heavy runtimes and VPC networking, fatal for tight SLAs",
      "Hard execution limits (duration, memory, payload) exclude long-running and stateful workloads by fiat",
      "Local development and testing remain perpetually second-class — the real platform exists only in the cloud",
      "At sustained high traffic, per-invocation pricing crosses over and an always-on container becomes cheaper",
    ],
    chooseWhen: [
      "Event-shaped glue: queue consumers, file-arrival triggers, webhooks, scheduled jobs — the home-turf workloads",
      "Traffic is spiky, low, or unpredictable, making pay-per-use the obvious economic winner",
      "A small team wants production-grade elasticity with no ops function at all",
    ],
    avoidWhen: [
      "Latency-critical request paths where a cold start is a broken promise",
      "Long-running, stateful, or connection-heavy workloads (streaming, big batch, chatty DB pools) that fight the execution model",
      "Sustained heavy traffic where the per-invocation bill quietly exceeds an always-on service",
    ],
    alternatives: [
      {
        techId: "paas-containers",
        note: "Scale-to-zero container platforms (Cloud Run class) cover much of the same ground without the execution limits — the middle path.",
        effort: "moderate",
      },
      {
        techId: "vms",
        note: "At steady heavy load, boring always-on compute is cheaper and free of cold starts.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "serverless-arch", note: "This is the hosting substrate that architecture is built on — the choices are made together or not at all." },
      { techId: "sqs-sns", note: "Queue-triggered functions with managed scaling and batching — the pattern the platforms optimized end to end." },
      { techId: "dynamodb", note: "Per-request pricing and no connection pools match the function model exactly; classic RDBMS connection limits do not." },
    ],
    frictionWith: [
      { techId: "hibernate", note: "Heavyweight ORM warm-up per cold start is real money and real latency — lightweight data access wins in functions." },
    ],
    commitments: [
      {
        need: "You now monitor cost per invocation as an architecture signal",
        why: "A retry loop, a chatty fan-out, or plain growth turns pay-per-use into the expensive option overnight — billing alarms are part of the design, not the finance team's problem.",
      },
      {
        need: "You now manage cold starts on every path that has an SLA",
        why: "Provisioned concurrency, runtime slimming, and dependency diets are permanent tuning work — the platform chooses your worst-case latency unless you keep paying attention.",
      },
      {
        need: "You now debug distributed by default",
        why: "Every feature spans functions, queues, and managed-service consoles — correlation IDs and tracing are prerequisites here, because there is no single process to attach to.",
      },
      {
        need: "You now test against a platform you can't run locally",
        why: "Emulators diverge from the real thing, so CI needs actual cloud environments — provisioning, isolating, and paying for them is part of the development loop now.",
      },
    ],
    tags: ["pay-per-use", "event-driven", "faas"],
  },
  {
    id: "static-edge",
    name: "Static + Edge Hosting",
    category: "hosting",
    tagline: "Vercel/Netlify-class CDN hosting — global, near-free, near-zero ops, for everything that compiles to files.",
    description:
      "For assets and SPAs: build output is pushed to a CDN and served from edge locations worldwide — no servers, no scaling question (it's cached files), TLS and atomic deploys included, often free at small scale. The architectural insight is the split: a pure SPA + API design lets the entire frontend live here even when the backend can't — half your system exits the ops conversation. Its limit is definitional: anything needing per-request server computation lives elsewhere (or in the platforms' edge functions, which is adjacent serverless, not static hosting).",
    scores: {
      performance: 10,
      devVelocity: 9,
      learningEase: 9,
      ecosystem: 8,
      scalability: 10,
      typeSafety: 3,
      opsSimplicity: 10,
      maturity: 8,
    },
    scoreNotes: {
      performance:
        "Pre-built files from a nearby edge node — the fastest possible way to serve anything, because nothing is computed at request time.",
      opsSimplicity:
        "The honest '10' of the category: push to a branch, the platform builds and deploys globally. There is nothing to patch, scale, or monitor at 2 AM.",
      scalability:
        "A traffic spike is a CDN cache-hit-rate story, not an incident — effectively unlimited for what it serves.",
      typeSafety:
        "The hosting layer is files and redirect rules; whatever type safety exists comes from your build pipeline, not the platform.",
    },
    strengths: [
      "Global low latency by default — every user hits a nearby edge node without you designing anything",
      "Effectively unlimited scale for static content: viral traffic is a bandwidth line item, not an outage",
      "Free or near-free at small scale; cheap at large scale",
      "Git-push deploys with previews, atomic releases, and instant rollbacks as table stakes",
      "Zero attack surface of your own: no origin server of yours to patch or harden",
    ],
    weaknesses: [
      "Definitionally static: per-request server logic needs another home — this hosts outputs, not computation",
      "Dynamic-looking features (auth, personalization, forms) route through APIs or edge functions — the simplicity boundary blurs fast",
      "The convenience platforms (Vercel/Netlify) wrap open standards in proprietary config, build pipelines, and pricing",
      "SPA-on-CDN pushes rendering to the client — SEO and first-paint concerns come with the pattern, not the host",
    ],
    chooseWhen: [
      "SPAs, docs, marketing sites — anything whose build step emits files should default here",
      "You've split SPA + API: the frontend lives here at near-zero cost and ops even when the backend needs real servers",
      "A global audience needs low latency and you have no interest in operating a global anything",
    ],
    avoidWhen: [
      "The app is server-rendered per request (SSR, htmx-style hypermedia) — there's a server in the loop by design",
      "Requirements force everything through private infrastructure with no public CDN in the path",
    ],
    alternatives: [
      {
        techId: "paas-containers",
        note: "When the frontend needs a real server (SSR, per-request logic), it becomes an app like any other — host it like one.",
        effort: "moderate",
      },
      {
        techId: "serverless-functions",
        note: "The standard companion for the dynamic 10%: static shell from the CDN, API calls to functions.",
        effort: "moderate",
      },
    ],
    pairsWellWith: [
      { techId: "react", note: "A pure SPA is static files — CDN hosting is free-tier cheap and operationally trivial." },
      { techId: "svelte", note: "Tiny bundles from a nearby edge node — extremely fast sites for nearly free." },
      { techId: "cdn-cache", note: "The same edge network that hosts your assets caches your API responses — one mental model for both." },
    ],
    frictionWith: [
      { techId: "htmx", note: "htmx's entire model is a server rendering HTML per request — static hosting has no server to render it. Opposite bets about where HTML comes from." },
    ],
    commitments: [
      {
        need: "You now own the build pipeline as your entire deployment surface",
        why: "There is no server to fix, so a broken build IS an outage of deploys — dependency churn, build-tool upgrades, and build-minute costs are the ops work that remains.",
      },
      {
        need: "You now adjudicate every dynamic feature's new home",
        why: "Auth, forms, and personalization can't live in static files — each new requirement reopens the 'API, edge function, or don't' question, and the simplicity boundary erodes one decision at a time.",
      },
      {
        need: "You now track what the convenience platform wraps around the standard",
        why: "The files are portable; the redirect rules, build config, and preview pipeline are Vercel/Netlify dialect — and their pricing tiers, not your traffic, decide when 'near-free' ends.",
      },
    ],
    tags: ["cdn", "static", "zero-ops"],
  },
];

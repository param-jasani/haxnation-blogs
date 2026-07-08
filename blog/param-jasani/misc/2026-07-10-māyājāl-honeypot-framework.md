---
slug: mayajal-honeypot-framework
title: "Māyājāl: A Self-Scaling, Agentic, Multi-LLM Honeypot Framework"
authors: [param-jasani]

tags:
  - honeypot
  - LLM
  - deception
  - threat-intelligence
  - MITRE-ATT&CK
  - YARA
  - Sigma
  - agentic-AI
  - Rust
  - Docker
  - misc

date: 2026-07-10T08:00:00.000Z

description: >
  Modern honeypots are hollow, easily fingerprinted and abandoned by attackers within minutes. Māyājāl is a self-scaling, agentic, multi-LLM honeypot framework built on a memory-safe Rust core that generates entire corporate deception environments on demand and converts every attacker keystroke into production-ready detections in real time.
---
Modern honeypots are hollow, easily fingerprinted and abandoned by attackers within minutes. Māyājāl is a self-scaling, agentic, multi-LLM honeypot framework built on a memory-safe Rust core that generates entire corporate deception environments on demand and converts every attacker keystroke into production-ready detections in real time.


<style>
.diagram-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.diagram-container figure {
  text-align: center;
}

.diagram-img {
  max-width: 100%;
  height: auto;
}
</style>

<!-- truncate -->
## Intro and some banter

If you opened this blog, I guess that either you are regular reader of blogs that I write on this site or you came through a post that I made on LinkedIn. Now today's blog is something different, its on a framework that me and couple of my friends worked on but were never able to complete due to some pedestals in our route, and we never tried to overcome them, so I would start with some banter regarding what happened and why finally I decided to publish this paper as a blog.

Yup! Last year, Me and my friend were trying to work on this framework, but we weren't able to publish this paper and here I am, I would like to publish this as a blog if people don't value the effort... Am I sounding frustrated? Because slightly I am, we tried to present the paper at a very novel conference in our country but were rejected with the comment as "The paper is completely AI Written, its language is not understandable. There is no clarity work." and many more comments, like did they even read the framework or I am just in a delusion that what we made is good and in reality it isn't (because every creator loves his own creation, might be the case that I am blind - referring to the same phenomena)? Just ping me on LinkedIn if you find it interesting, I wanted to work on it, but rejected the idea of bringing it to life, why? because I tried to make it as a semester project and the external that came to review it, by looking at the prototype told us that it was trash and he would fail us if we continued this and said we just wasted our time.

At the end, I thought that he(the external faculty that came to review) might not be wrong, we did not do something novel, we just arranged some bits and pieces that were created by some other great people and put them together to create a new framework and gave it a name and were calling it novel, now what brings me here then, if I already had that thought in my mind, I am still unsure that people require this framework or not. So presenting you this novel or cliché or novel or cliché or novel or cliché.... I still don't know, So presenting you this framework...... DRUMS!!

> **Note:** Māyājāl is currently presented as a framework and architectural design. A reference implementation is NOT under active development. This blog post is based on a research paper I co-authored with a colleague. The high-level ideas, core architectural decisions, and the overall system design are mine. The implementation details of the Persona Factory workflow were contributed by my colleague, why? because he is great at AI, and I am not, he designed something good, you will later see in this blog.

---

## The Problem

There is no problem as such with exsisting solutions, as I already told you we were planning to write a paper on it so I will keep the section headers as it is, why? because I want to make the fun of FORMAT specified by people who do not know anything about our field and the whole purpose of this framework was to increase attacker dwell time and make the honeypot seem as realistic as possible. And as the FORMAT says that you have to identify some gaps in exisisting solutions so here we go, there are no gaps in them, they all are great on their own, infact we are inspired from them and this framework is trying to improve existing systems(by putting everything together).

---

## The Trilemma That Has Haunted Honeypot Design

The [HoneyGPT](https://arxiv.org/abs/2406.01882) paper formalized a structural conflict that has plagued terminal honeypot design:

> **The Flexibility–Interaction–Deception Trilemma:** No existing terminal honeypot can simultaneously deliver all three of these properties.

| Property | What It Means |
|---|---|
| **Flexibility** | Ability to instantiate hundreds of distinct personas and configurations without manual effort |
| **Interaction Depth** | Survival under interactive tools and long-running sessions |
| **Deception Quality** | Presence of believable user artifacts (browser history, SSH keys, corporate documents) and consistent system state |

No pre-LLM system could achieve more than two simultaneously:

- **Real OS honeypots** offered interaction depth and deception - but zero flexibility (one physical or virtual host per instance).
- **Scripted medium-interaction honeypots** (like Cowrie) offered flexibility and modest deception — but collapsed under real interaction (`vim`, `strace`, `/proc` checks).

---

## How Previous LLM Honeypots Tried (and Failed)

### First Generation: Commercial LLMs (2023–2024)

Projects like [HoneyGPT](https://arxiv.org/abs/2406.01882), LLMHoney, and [SSHoney](https://arxiv.org/abs/2409.08234) demonstrated that a commercial LLM (GPT-4, Claude 3, Gemini 1.5) could generate plausible terminal responses. Median dwell time jumped from seconds to 8–15 minutes — a genuine improvement.

But they suffered from fatal limitations:

- **Hallucinated filesystem and process state** — No real `/home`, `/proc`, or persistent files. The LLM made up directory listings that contradicted themselves across commands.
- **Single-instance Python architecture** — Vulnerable to memory leaks, crashes under interactive tools, and container escape.
- **Zero horizontal scaling** — Each new IP or persona required a separate process and hand-crafted prompt.

### Second Generation: Local LLMs (2024–2025)

Projects like [Beelzebub](https://github.com/mariocandela/beelzebub) (SSH honeypot) and [Galah](https://github.com/0x4D31/galah) (HTTP web honeypot) replaced commercial APIs with locally hosted models (Llama 3, Mixtral, Command-R) via Ollama or vLLM. This eliminated API costs and reduced data exfiltration risk.

But because none of these models were fine-tuned on authentic terminal interaction data, they routinely produced:

- Wrong error messages and impossible file permissions
- Inconsistent command outputs
- Obvious linguistic and behavioral artifacts

Interaction depth *regressed*, attackers disengaged rapidly, and **scalability remained entirely manual**.

---

## Introducing Māyājāl

**Māyājāl** (from Sanskrit, meaning *web of illusion*) is a terminal honeypot framework that simultaneously addresses all three corners of the trilemma. It is built as a **self-scaling, agentic, multi-LLM ecosystem** on top of a **memory-safe Rust attack surface**.

Here's how each corner is solved:

| Trilemma Corner | Māyājāl's Solution |
|---|---|
| **High-Fidelity Realism** | A fine-tuned code model (via QLoRA + CorDA continued pre-training) on real and synthetic Ubuntu terminal sessions — survives `vim`, `tmux`, `gdb`, `strace`, and complex priv-esc chains |
| **Sustained Engagement** | An agentic LLM (Persona Factory) autonomously synthesizes entire corporate workforces — hundreds of employees with complete digital lives |
| **Operational Scalability** | The same agent deploys Dockerized honeypot containers on demand, binding them to new IPs with zero human intervention |

And critically, a **second agent** (the TTP Analyst) continuously transforms raw honeypot sessions into structured MITRE ATT&CK timelines, YARA rules, Sigma rules, and incident reports — closing the loop from keystroke to detection in seconds.

---

## System Architecture

Māyājāl is designed as a high-interaction deception framework where honeypots are not isolated artifacts but an **autonomous, self-scaling ecosystem**. All components are containerized using Docker Compose.

At the center is a Rust-based SSH/Telnet honeypot that intermediates all attacker interactions. This core communicates with three specialized LLMs and a unified data store powered by SQLite, while a defender dashboard exposes configuration, persona generation, and threat intelligence outputs.

<div class="diagram-container">
  <figure>
    <img
      class="diagram-img"
      src="https://raw.githubusercontent.com/haxnation/blog/main/blog/param-jasani/misc/imgs/mayajal-architecture.png"
      alt="Māyājāl System Architecture Diagram"
    />
    <figcaption class="diagram-caption">
      <strong>Fig 1:</strong> End-to-end system architecture of Māyājāl showing the Rust SSH core, three specialized LLMs, SQLite virtual filesystem, SIEM integration, and React defender dashboard.
    </figcaption>
  </figure>
</div>

### The Rust SSH/Telnet Core

The attacker-facing server is implemented in Rust using [russh](https://github.com/warp-tech/russh) for SSH protocol handling and [Tokio](https://tokio.rs/) for asynchronous PTY emulation. Rust was chosen specifically for **memory safety** — it mitigates common exploit vectors like buffer overflows that plague Python, Go, or C-based honeypots.

Upon connection on port 22, the core presents a realistic Ubuntu-like environment: login banners, dynamic MOTD messages, and persona-specific configuration.

### The Three-Tier Command Resolution Pipeline

Command handling follows a **deterministic three-tier resolution pipeline** that balances fidelity and latency:

#### Tier 1 — Native Resolution (Microseconds)

Frequently used, non-filesystem commands (`pwd`, `whoami`, `history`, `uname -a`) are executed entirely inside the Rust core using in-memory state. These complete within microseconds and require no backing store access.

#### Tier 2 — Virtual Filesystem Emulation (Milliseconds)

Filesystem-related operations (`ls -la`, `cat`, `chmod`, `mv`, arbitrary writes) are mapped onto an **SQLite-backed virtual filesystem**. The core performs atomic SQL transactions for path resolution, permission enforcement, timestamp updates, and BLOB retrieval (Chrome cookies, history databases, binary artifacts). ACID semantics prevent state drift during concurrent or piped command sequences.

#### Tier 3 — Delegated Emulation via LLM (Variable)

Complex or unknown commands (`strace`, `apt update | grep error`, `mysql`, interactive tools like `vim`) are forwarded to **LLM-1** (the Deception Engine) along with session metadata: user identity, current working directory, privilege level, and recent command history. The model returns only the terminal output and updated shell prompt — no hallucinated state leaks into the environment.

> This tiered approach means the vast majority of commands resolve in microseconds or milliseconds. The LLM is only invoked when genuine complexity demands it, keeping latency low and realism high.

### Logging and SIEM Integration

All executed commands are transformed into **encrypted JSON records** containing timestamps, source IP, user, CWD, input, truncated output, and an HMAC-SHA256 signature. These records are streamed to SIEM systems via syslog or HTTP forwarders — **no logs are persisted locally on the honeypot**, preventing an attacker from tampering with evidence.

---

## The Deception Engine (LLM-1): Fine-Tuned Terminal Emulation

The Deception Engine is the backbone of Māyājāl's realism. It's a code-specialized LLM subjected to **continued pre-training using QLoRA and CorDA** on a corpus of:

- Real terminal transcripts
- Package manager logs
- Shell error messages
- Interactive utility sessions (`vim`, `tmux`, `gdb`, `strace`)
- Privilege escalation chains

### Why Fine-Tuning Matters

This is what separates Māyājāl from every previous LLM honeypot. Earlier systems used general-purpose models (GPT-4, Llama 3, Mixtral) that were never trained on terminal interaction data. They produced responses that *looked* plausible but were riddled with subtle errors — wrong error codes, impossible file permissions, inconsistent process tables — that experienced attackers spotted instantly.

By applying [QLoRA](https://arxiv.org/abs/2305.14314) (Quantized Low-Rank Adaptation) and [CorDA](https://arxiv.org/abs/2406.05223) (Context-Oriented Decomposition Adaptation) continued pre-training on a curated terminal corpus, the resulting model is designed to:

- Handle interactive tools (`vim`, `tmux`, `gdb`) for extended sessions
- Produce correct error codes and permission strings
- Maintain filesystem and process table consistency across long conversations
- Survive complex multi-step privilege escalation chains

### Structured Prompt Design

The model receives a structured prompt containing:

- Raw command
- User identity and privilege level
- Current working directory
- Truncated history window
- Relevant filesystem context (optional, for complex commands)

The output is **strictly constrained** to:

1. Terminal output text
2. ANSI escape sequences (where appropriate)
3. The correct next shell prompt

Nothing else. No explanations, no commentary, no hallucinated state.

---

## The Persona Factory (LLM-2): Autonomous Corporate Ecosystem Generation

> This is the component that breaks the scalability barrier that every previous honeypot system has hit.

A defining limitation of all prior LLM-based honeypots has been the manual effort required to create and deploy realistic victim personas. **Māyājāl eliminates this bottleneck entirely.**

The Persona Factory is a fully autonomous orchestration subsystem that transforms a single natural-language directive from the defender into **hundreds of complete corporate employees**, their digital artifacts, and the live honeypot containers required to expose them.

### How It Works

The defender submits a request through the React-based management dashboard. Something like:

> *"Deploy 180 employees at MediCore Health: 70 Oracle DBAs, 80 software developers, 30 clinical analysts, with realistic behavioral traits and high-value credentials."*

This request triggers a **stateful agentic workflow** implemented using [LangGraph](https://github.com/langchain-ai/langgraph), a production-grade directed acyclic execution engine. A frontier commercial LLM serves as the sole reasoning component, performing all planning, generation, validation, storage, and infrastructure provisioning via structured function calling.

The workflow proceeds through **six specialized nodes**:

### 1. Planner Node

The LLM decomposes the request into role-specific cohorts, selects behavioral traits (e.g., *"overworked junior DBA"*, *"compliance-conscious analyst"*), and produces a structured execution plan specifying cohort sizes, trait distributions, and infrastructure requirements.

### 2. Generator Node

The LLM is invoked in parallel batches (up to 20 concurrent calls) using a rigorously enforced JSON schema. For **each persona**, the model outputs:

- **Identity metadata** — full name, username, title, department
- **A complete virtual home directory** (25–45 files) containing:
  - Shell configuration (`.bashrc`, `.profile`)
  - SSH key pairs (`.ssh/id_rsa`, `authorized_keys`)
  - **Chrome profiles** — realistic SQLite databases with Cookies, History, and Bookmarks
  - Role-specific configuration files
  - Documents containing synthetic PII
  - <mark>Deliberately planted high-value secrets</mark> — database credentials, cloud access keys, VPN certificates, and sloppy configurations ("frustrated junior DBA who forgets to revoke old privileges")

All files are annotated with correct octal permissions, plausible timestamps, and ownership metadata consistent with the assigned behavioral traits.

### 3. Validator Node

A second LLM invocation performs schema compliance, syntactic correctness (valid SQL syntax, realistic AWS ARN formats), trait fidelity, and deduplication checks. Invalid outputs trigger **automatic reflection and regeneration** until compliance is achieved.

### 4. Storage Node

Validated artifacts are committed **atomically** to the central SQLite state database. Employee profiles populate an `employees` table; filesystem objects (including binary artifacts stored as BLOBs) are inserted into a `files` table with foreign-key relationships. A background service simultaneously materializes the directory trees under a shared volume accessible to all honeypot containers.

### 5. Orchestrator Node

The LLM evaluates current swarm capacity by querying the Docker daemon. If the ratio of active victims to running containers exceeds a configurable threshold (default 50:1), it **autonomously invokes the Docker SDK** to scale the Rust honeypot service:

```bash
docker compose up --scale rust_honeypot=+N
```

New containers are provisioned on new external IPs via integrated cloud provider APIs. They immediately inherit the updated victim population through the shared SQLite volume.

> If the attacker is performing privilege escalation or lateral movement, the Rust server detects it and triggers the Persona Factory to spawn only the specific user's honeypot container on demand — ensuring resources are allocated only when needed.

### 6. Notifier Node

Upon completion, the LLM generates a concise execution report and delivers it via WebSocket to the defender, including an updated inventory of deployed victims and newly allocated public IPs.

> **Result:** A single defender command produces a fully operational, multi-IP deception environment in under two minutes. No manual filesystem staging, no hand-crafted prompts, no separate process management.

---

## The TTP Analyst (LLM-3): Closed-Loop Threat Intelligence

The TTP Analyst is the final layer — a fully autonomous, tool-augmented agentic system that continuously transforms raw attacker interactions into **structured, production-grade detection engineering artifacts** within seconds.

### The Tool Suite

The agent is provisioned with a comprehensive, extensible set of tools:

| Agent/Tool | Function |
|---|---|
| **Log Ingestion Agent** | Continuously monitors encrypted JSON command streams arriving at the SIEM via webhook subscriptions or authenticated polling |
| **Filesystem Correlation Agent** | Read-only access to the shared SQLite virtual filesystem — retrieves and inspects files written or modified by the attacker |
| **Static Analysis Agent** | Executes YARA rules and ClamAV signatures against dropped payloads, extracting strings, imports, and section characteristics |
| **Dynamic Analysis Agent** | Triggers lightweight, containerized sandbox execution for unknown binaries in full isolation |
| **External Enrichment Agent** | Performs hash-only lookups against VirusTotal and MalwareBazaar; with defender approval, submits anonymized samples for deeper analysis |
| **ATT&CK Mapping Agent** | Maintains an embedded, versioned MITRE ATT&CK representation and classifies command sequences into techniques with probabilistic confidence scores |
| **YARA Rule Synthesis Agent** | Generates context-aware YARA rules tailored to observed strings, imports, and behavioral indicators |
| **Sigma Rule Synthesis Agent** | Crafts Sigma detection logic targeting exact command-line patterns, process ancestry, and file paths from the session |
| **Reporting & Dissemination Agent** | Structures the final intelligence package, persists it in the database, and pushes real-time notifications via WebSocket to the dashboard |

### How It Operates

The agent runs in a **persistent reasoning loop**:

1. Detects new attacker activity via the SIEM stream
2. Autonomously determines the optimal tool chain
3. Orchestrates parallel and sequential tool calls
4. Performs cross-correlation between log events and filesystem state
5. Resolves ambiguities through iterative reasoning
6. Converges on a definitive threat intelligence artifact

The output is a structured intelligence package containing:

- **MITRE ATT&CK timeline** — every observed technique mapped with confidence scores
- **Incident narrative** — human-readable summary of the attacker's session
- **YARA rules** — ready to deploy against the specific malware or tools observed
- **Sigma rules** — detection logic matching the exact command patterns used
- **Defender-action recommendations** — prioritized response steps

### One-Click Intelligence Sharing

From the React dashboard, defenders can forward dropped binaries, suspicious files, or entire sessions to external threat-intelligence and sandboxing platforms with a single click:

- VirusTotal, MalwareBazaar, Tria.ge, CAPE
- Cisco Talos Intelligence, Hybrid Analysis
- Any.Run, Joe Sandbox, Shodan

> **The result:** Every attacker action is immediately converted into deployable defensive content. Māyājāl transforms from a passive observation platform into an **active, self-improving component** of the defender's detection and response capability.

---

## What Makes Māyājāl Different

To our knowledge, Māyājāl is the first system to combine:

| Capability | Māyājāl | Previous Systems |
|---|---|---|
| Memory-safe attack surface | ✅ Rust (russh + Tokio) | ❌ Python, Go, or C |
| Fine-tuned terminal emulation | ✅ Code model + QLoRA/CorDA on terminal data | ❌ Generic LLMs (GPT-4, Llama 3) |
| Autonomous persona generation | ✅ Agentic LLM creates hundreds of employees on demand | ❌ Manual prompt crafting per instance |
| Self-scaling infrastructure | ✅ LLM-driven Docker orchestration | ❌ Manual container provisioning |
| Real-time detection engineering | ✅ Autonomous YARA/Sigma/ATT&CK generation | ❌ Manual log analysis |
| SQLite virtual filesystem | ✅ ACID-compliant, BLOB-backed, shared across instances | ❌ Hallucinated or static filesystems |

No prior work solves more than two corners of the trilemma simultaneously. Māyājāl addresses all three while adding closed-loop detection engineering.

---

## Known Limitations

We believe in being transparent about what Māyājāl *can't* do yet:

### Commercial Model Dependency

The Persona Factory and TTP Analyst currently rely on proprietary frontier models. This introduces reproducibility concerns, potential cost barriers, and non-determinism from provider-side updates and safety filtering. Future iterations will explore fine-tuned open-source alternatives with local inference engines like vLLM or llama.cpp.

### Inference Latency for Complex Commands

While Tier 1 and Tier 2 commands resolve in sub-millisecond times, Tier 3 delegation to the Deception Engine introduces variable latency. Sophisticated attackers using timing-based fingerprinting may detect this delay, particularly on low-load honeypots.

### Cold-Start Realism Gap

Newly provisioned honeypot instances require the Persona Factory to populate the SQLite virtual filesystem before becoming fully convincing. This brief window represents a theoretical detection vector for extremely rapid reconnaissance.

### Network Outbound Simulation

Outbound network connections (reverse shells, C2 callbacks) are emulated locally through LLM-generated outputs and Rust-based response simulation. This preserves operational security by preventing actual network egress, but introduces a detection vector: attackers verifying their C2 server logs will observe the absence of genuine inbound connections. Allowing real outbound access would enhance realism but poses unacceptable risks to hosting infrastructure.

---

## Future Work

Immediate efforts will focus on:

- **Large-scale deployment** across heterogeneous cloud environments to gather longitudinal attacker interaction data
- **Controlled red-team exercises** with both automated scripts and human operators to validate the tiered command resolution strategy
- **Open-source model alternatives** for the Persona Factory and TTP Analyst to enhance reproducibility and reduce costs
- **Hybrid egress models** — proxy-based forwarding to isolated sandbox endpoints, or federated deception networks where honeypots collaboratively emulate realistic traffic patterns
- **Self-improving feedback loops** — real attacker sessions are automatically harvested and folded back into the continued pre-training corpus, enabling recursive refinement of the Deception Engine with every sophisticated intruder it attracts

---

## Conclusion

Māyājāl represents a fundamental departure from the static, manually scaled honeypots that have dominated deception research for two decades. By replacing brittle scripting with a tiered, memory-safe Rust core backed by a single atomic SQLite virtual filesystem, and by delegating behavioral fidelity to three specialized, agentic LLMs, the framework achieves a level of attacker dwell time, environmental consistency, and horizontal scalability that prior systems have never simultaneously attained.

Most importantly, the fully autonomous Persona Factory and Real-Time TTP Analyst close the <mark>deception-to-detection loop</mark> in a manner that is without precedent: **high-level defender intent is translated into live corporate illusions at arbitrary scale, and every adversary action is immediately converted into structured, production-ready detection content without human analysis.**

Māyājāl is not a fixed artifact — it's designed to be a living, self-healing deception ecosystem that improves with every sophisticated intruder it attracts.

> **A reference implementation is under active development. We invite collaboration from the research community to implement and evaluate these extensions.**

---

## References

1. A. X. Zhang et al., "[LLM Honeypot: Towards next-gen interactive deception systems](https://arxiv.org/abs/2409.08234)," arXiv:2409.08234, Sep. 2024.
2. L. K. Sharif et al., "[HoneyGPT: Breaking the Trilemma in Terminal Honeypots with Large Language Model](https://arxiv.org/abs/2406.01882)," arXiv:2406.01882, Jun. 2024.
3. A. Amin et al., "LLMHoney: Large-language-model-driven honeypots for interactive deception," 2024.
4. M. Candela, "[Beelzebub: AI-native deception runtime / honeypot framework](https://github.com/mariocandela/beelzebub)," GitHub, 2024.
5. A. Karimi, "[Galah: LLM-powered web honeypot](https://github.com/0x4D31/galah)," GitHub, 2024.
6. T. Dettmers et al., "[QLoRA: Efficient finetuning of quantized LLMs](https://arxiv.org/abs/2305.14314)," NeurIPS, 2023.
7. Y. Yang et al., "[CorDA: Context-Oriented Decomposition Adaptation](https://arxiv.org/abs/2406.05223)," NeurIPS, 2024.
8. DeepSeek-AI, "[DeepSeek-Coder: Enhancing code generation capabilities](https://github.com/deepseek-ai/DeepSeek-Coder)," GitHub, 2024.
9. R. Y. Pang et al., "[ReAct: Synergizing reasoning and acting in LLMs](https://arxiv.org/abs/2210.03629)," arXiv:2210.03629, Oct. 2022.
10. LangChain, "[LangGraph: Directed workflow framework for agentic LLM systems](https://github.com/langchain-ai/langgraph)," GitHub, 2024.
11. MITRE Corporation, "[MITRE ATT&CK](https://attack.mitre.org/)," 2023.
12. SigmaHQ, "[Sigma: Generic signature format for SIEM systems](https://github.com/SigmaHQ/sigma)," 2023.
13. VirusTotal/Cisco Talos, "[YARA: Pattern matching for malware research](https://virustotal.github.io/yara/)," 2016.

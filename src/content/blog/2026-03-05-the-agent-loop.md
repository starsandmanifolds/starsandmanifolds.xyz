---
title: The Agent Loop
excerpt: Every AI agent is a three-branch recursive function.
tags: ["AI", "LLMs", "agents"]
state: published
---

Every AI agent you've ever used is this:

$$
\begin{array}{lcl}
\text{agent}(s) & = & \textbf{match } \text{model}(s) \\[6pt]
\;\; | \;\; \text{Answer}(a) & \to & s + a \\[3pt]
\;\; | \;\; \text{Action}(t) & \to & \text{agent}(s + t + \text{exec}(t)) \\[3pt]
\;\; | \;\; \text{Length} & \to & \text{agent}(\text{compress}(s))
\end{array}
$$

$s$ is the conversation history. $+$ is concatenation. That's the whole architecture.

---

<small><em>P.S. Everything the equation doesn't cover: streaming, error handling, retries, context window management, token counting, cost control, prompt caching, tool sandboxing, rate limiting, authentication, parallel execution, observability, structured output validation, latency optimization, evaluation, and getting the system prompt right. Minor details.</em></small>

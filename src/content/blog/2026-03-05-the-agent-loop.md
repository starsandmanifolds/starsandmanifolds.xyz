---
title: The Agent Loop
excerpt: "Every AI agent is a recursive loop: ask the model, answer or act, then continue."
tags: ["AI", "LLMs", "agents"]
state: published
---

Every AI agent you've ever used is this loop:

$$
A(s)=
\operatorname{case} M(s) \operatorname{of}
\begin{cases}
\mathrm{Answer}(a) \Rightarrow s\oplus a \\
\mathrm{Action}(t) \Rightarrow A(s\oplus t\oplus E(t))
\end{cases}
$$

Here $A$ is the agent, $M$ is the model, and $E$ is tool or environment execution. The state $s$ is the model-visible transcript, modeled as a sequence of messages and tool events. The outputs $a$, $t$, and $E(t)$ are transcript entries, and $\oplus$ appends them to the transcript.

The loop is simple: the model either answers, or asks for an action. If it asks for an action, the agent executes it, concatenates the action and result onto the transcript, and runs the loop again.

This version quietly assumes infinite context. Real agents have finite context windows, so the state may need to be normalized before each model call. Context management is a preprocessing step, not a third model outcome. Let $\ell(s)$ be the length of the state, $L$ be the context limit, and $C$ be the compression function. For a given state $s$, define the model-visible state $\hat{s}$ as:

$$
\hat{s}=C_L(s)=
\begin{cases}
C(s), & \ell(s)>L \\
s, & \text{otherwise}
\end{cases}
$$

With finite context, the loop becomes:

$$
A(s)=
\operatorname{case} M(\hat{s}) \operatorname{of}
\begin{cases}
\mathrm{Answer}(a) \Rightarrow \hat{s}\oplus a \\
\mathrm{Action}(t) \Rightarrow A(\hat{s}\oplus t\oplus E(t))
\end{cases}
$$

$\hat{s}$ is the transcript the model actually sees: compressed if needed, otherwise unchanged.

---
title: "Why I'm Building Yet Another Agentic Harness"
excerpt: "I'm building yokelabs, an experimental Rust runtime for agents, because I want the UI and the agent loop to be programmable parts of the system rather than fixed assumptions." 
tags: ["AI", "Agents", "Rust", "Tools", "TUI"]
state: published
---

I’m building yet another agentic harness.

That is a mildly embarrassing sentence to write at a moment when we already have several good ones.

Two of the projects that have influenced me the most here are [opencode](https://github.com/sst/opencode) and [pi](https://pi.dev/). They’ve done serious work in making agentic tooling usable, composable, and pleasant. So this is not a "someone else is wrong, therefore I must rebuild the stack" post.

It is a narrower claim than that.

The more time I spend with agent systems, the more I feel that most harnesses make two very large decisions for you much earlier than they should:

1. what the UI is, and  
2. what the agent loop is.

You can often swap models. You can usually add tools. You can sometimes add commands, extensions, and themes. But once you get below that layer, the host process itself tends to harden into product code. The interface is largely fixed. The orchestration model is largely fixed. The system has extension points, but not always in the places I most want them.

That is the gap I want to explore.

The project is called **yokelabs**. The goal is not to build a better coding agent in the narrow sense. The goal is to build a more general, more extensible, and more responsive **runtime for agents**.

## The Assumption I Want to Break

I think we have quietly normalized a strange idea in agent tooling: that the harness is configurable, but not really programmable.

You can configure the agent’s capabilities. You can configure some of the environment around it. But the host, the thing that owns rendering, interaction, orchestration, and runtime behavior, is often treated as a fixed appliance.

I want to push against that.

My working thesis for yokelabs is simple:

> an agentic harness should not only let you customize the agent; it should let you customize the host.

That means I want to treat the harness itself as a design space.

Not just which model to call. Not just which tools are available. But also:

- how work is rendered,
- which intermediate states are visible,
- how input and output flow through the system,
- how orchestration happens,
- how subagents collaborate,
- and how much of that behavior can be reshaped without forking the project.

At a high level, the direction is a minimal Rust core that handles the things extensions cannot sensibly do for themselves, like terminal rendering, streaming, process management, and the event loop, while pushing as much behavior upward as possible.

That does not mean “minimal” in the shallow sense. It means minimal **and carefully designed**. A small core is only good if its primitives are expressive enough that extensions do not keep slamming into walls.

## Why Build This?

There are three reasons.

### 1. Existing harnesses are less responsive than I want them to be

When people say an AI harness feels slow, they usually blame the model.

Sometimes that is exactly right. The model is slow.

But I increasingly think a lot of perceived slowness in agent systems comes from something else: the harness is not doing a good enough job of exposing what is happening while the model is slow.

An agentic system is rarely doing one thing at a time. It may be waiting on a model response, streaming partial output, running a tool, dispatching a subprocess, or preparing the next step in the loop. But from the user’s perspective, all of that often collapses into a generic loading state.

The result is a system that feels more opaque, and therefore slower, than it should.

One of the goals I wrote down early for yokelabs is blunt: **“The LLM is slow” is acceptable. “The harness is slow” is not.**

That means I care about responsiveness as an architectural property, not just a visual one. If a keypress lands, the interface should react immediately. If work is in progress, the system should make that legible. If multiple things are happening at once, the UI should not become inert.

This is part of why the second public RFD I wrote was not about agents at all, but about **event architecture**. A terminal application that blocks on the wrong things will feel dead, no matter how nice the widgets look. If the harness is going to stream model output, animate state, handle tools, and stay interactive, the runtime has to be designed for that from the start.

## 2. I want the UI and the agent loop to be real extension points

The deeper reason for the project is that I think most frameworks are extensible at the wrong layer.

They often let you customize what the agent can *do*, but not enough of how the overall system *behaves*.

That matters because the UI is not ornamental. It shapes how comprehensible the system feels. It determines whether waiting is opaque or informative, whether progress is legible, whether subagent work is visible, and whether the whole experience feels like a tool or a sealed box.

The same is true of the agent loop. The loop is not just an implementation detail. It encodes the system’s theory of how reasoning, action, context, interruption, recovery, and delegation should work.

Those are not small decisions.

They are the heart of the harness.

So one of the things I want yokelabs to make possible is a much deeper kind of customization than “add a tool” or “change the prompt.” I want the host to be open enough that a different interaction model or a different orchestration model can be built on top of it.

I am still working through the exact abstractions here, and I do not want to pretend all of those details are settled. But the broad direction is clear: I want the harness to expose structured runtime behavior in a way that a different UI or a different loop can meaningfully hook into, rather than leaving those choices buried in inaccessible internals.

## 3. I want a harness that makes experiments cheap

This is probably the most important reason long-term.

I want a runtime that makes it easy to test ideas about agent systems.

A lot of conventions in current harnesses feel more inherited than justified. They may be sensible defaults, but they are still defaults. And defaults harden quickly.

Take subagents as one example. In most systems I’ve looked at, a parent agent hands a task to a subagent, the subagent runs privately, and the parent eventually gets back an output. That is a very narrow collaboration model.

But why should that be the only one?

Maybe the parent should be able to inspect more of the subagent’s intermediate reasoning before deciding how much to trust the final answer.

Maybe the subagent should be able to stream partial work back upstream and receive feedback in real time.

Maybe the parent should be able to intervene mid-flight rather than only after completion.

Maybe the UI should be able to show that collaboration as a live structure instead of flattening it into request-and-response.

I am not claiming all of those ideas are good. I am claiming they are worth being able to test.

And right now, in many harnesses, the cost of testing ideas like that is too high because the orchestration model is not really open to you. Before you can evaluate the idea itself, you have to fight the framework.

I want yokelabs to reduce that cost.

## Why a Terminal Runtime?

The first public RFD for yokelabs is about goals and design principles, and one of the simplest is also one of the most important: the primary user is a software engineer who lives in a terminal.

That matters to me for two reasons.

First, the terminal is still the most universal interface for the kind of user I care about here. It works locally, over SSH, on remote machines, inside development environments, and across a wide range of systems without asking for a full graphical stack.

Second, the terminal imposes useful constraints. It forces you to think carefully about interaction, latency, state, and rendering. If a terminal UI feels crisp and legible, it usually got there by design rather than by accident.

I’m not religious about the TUI as a permanent limit. A headless core with other frontends is a perfectly reasonable future direction. But for now, the terminal is the right ground to stand on.

## Why Rust?

Partly because this project genuinely seems like a good fit for Rust.

And partly because I want an excuse to learn Rust properly.

I did not want to “learn Rust” by writing a toy project that politely sidestepped the hard parts. I wanted something that would force me to care about architecture, concurrency, state machines, streaming, ownership, and performance all at once.

This is that project.

A harness like this lives right at the boundary where I think Rust is compelling: long-lived runtime state, asynchronous I/O, process control, low-latency updates, and a strong incentive not to accidentally build something sluggish.

I also care a lot about the **subjective** feeling of speed. I want the interface to feel alive. I want state to update incrementally. I want concurrent work to be visible without turning the screen into noise.

Rust will not magically solve any of that. But it is a very good language in which to take those concerns seriously.

## Design Before Implementation

I am trying not to sprint straight into code and discover the architecture by accident.

Before building much of the implementation, I’ve been writing RFDs for the major design questions. The point is to make the tradeoffs explicit while they are still cheap to change.

The first two public RFDs are up now:

- [RFD 001: Project goals and design principles](https://github.com/yokelabs/rfd/blob/main/rfd-001.md)
- [RFD 002: Event architecture](https://github.com/yokelabs/rfd/blob/main/rfd-002.md)

They cover the basic commitments behind the project: yokelabs is a general-purpose runtime for agents, extensibility is a first-order concern, the core should be minimal but expressive, the terminal is the primary interface, and performance claims should be measured rather than romanticized.

I have also been exploring later design questions around extensions, providers, host APIs, and UI surfaces. Those are useful working documents for me, but I do not want to present them as frozen plans yet. One of the reasons to write RFDs in the first place is to give yourself permission to think in public without pretending every draft is destiny.

## Who I Hope This Is For

I’m building yokelabs for people who care about their tools enough to want to shape them.

More specifically, I think this kind of project is for programmers who approach tooling like tradesmen approach instruments. They do not just use tools; they refine them. They care whether something is inspectable, replaceable, and legible under real working conditions.

I think that mindset will matter more, not less, in the age of AI.

If these systems are going to become part of serious technical work, then serious users should have harnesses that they can modify in meaningful ways. Not just configure. Not just theme. Actually modify.

That is the bar I’m aiming for.

## Closing

So yes, this is yet another agentic harness.

But the point is not to produce a clone with slightly different defaults. The point is to build a runtime where the host itself is part of the design space: where responsiveness is treated as architecture, where the UI is not taken for granted, where the loop is not taken for granted, and where experimentation does not require breaking open the framework first.

If that works, yokelabs will be more than another shell around a model. It will be a place to explore what an agentic harness can be when the host is genuinely programmable.

More soon.

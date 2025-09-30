---
title: "When 'That's Interesting' Means 'I Disagree'"
excerpt: "A tool that converts educational videos into enhanced transcripts with cultural context, quizzes, and flashcards—built because my wife needed it for her doctorate."
tags: ["C#", ".NET", "AI", "Education", "CLI"]
state: published
---

My wife is doing her doctorate. She didn't grow up in the US, so when a professor says "that's interesting," "I hear what you're saying," or "that's one way to look at it," she takes them at face value, not realizing they often signal disagreement. And it's not just phrases like that, but other things relevant to American culture too. The lecture makes sense on the surface, but there's meaning between the lines she doesn't catch, and as the saying goes: you don't know what you don't know!

So I built **Scribe**, a CLI tool that takes lecture videos and generates enhanced transcripts, quizzes, and Anki decks for spaced repetition. It explains idioms and cultural references inline, defines technical terms immediately, fixes transcription errors, and organizes the flow into neatly structured sections from otherwise disorganized lectures. She used it to prepare for her midterms last week, working through the enhanced transcripts, testing herself with the quizzes, and reviewing the flashcards.

The current version handles audio, but the same approach could work for video (capturing what's on screen, not just what's said), PDFs (course readings and textbooks), and even foreign language content.

This would've been impossible a few years ago, but modern LLMs make it straightforward. I'm really proud of it, and it's helping her quite a bit; she's always asking me if I've Scribe'd a lecture yet. She's from a non-technical background, which means every time I Scribe a lecture, she treats it like I've just pulled off a magic trick. (She's like this about anything technical I build, which I absolutely adore about her. ❤️) It's the perfect setup: her amazement encourages me to keep tinkering with projects that might make her life easier, and since I find this stuff fascinating anyway, it's really just me playing around, except the end result happens to help her get through her doctorate. Even to me, it feels like magic.

If you're curious about the technical implementation, I'm planning a follow-up post on the architecture and AI pipeline.

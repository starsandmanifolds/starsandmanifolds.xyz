---
title: "RITU: Redirect Intent to UPI"
excerpt: "A tiny HTTPS-to-UPI protocol bridge, built because Telegram strips non-HTTPS links."
tags: ["SvelteKit", "Svelte", "UPI", "Cloudflare", "TypeScript"]
state: published
---

I have a Telegram bot that sends me payment reminders. The problem: UPI payment links use the `upi://` URI scheme, and Telegram, in its infinite wisdom, strips out anything that isn't an `https://` link. So my bot could tell me *what* to pay, but couldn't give me a tappable link to actually pay it. I had to manually open my UPI app and type in the details myself. Tedious.

Naturally, the only reasonable response was to register a domain, build a website, and deploy it to Cloudflare's global edge network.

Meet [**RITU**](https://github.com/adyavanapalli/ritu) (**R**edirect **I**ntent **T**o **U**PI), a site that bridges HTTPS to `upi://`. You construct a standard HTTPS link with your payment details as query parameters:

```
https://payviaupi.link/pay?pa=ritu@ybl&pn=Ritu&am=50&tn=coffee
```

Open that on your phone, tap "Pay via UPI," and your OS fires the corresponding `upi://pay?pa=ritu@ybl&pn=Ritu&am=50&tn=coffee` deep link, opening your UPI app with everything pre-filled.

The entire core logic is one line of Svelte 5:

```typescript
const upiUrl = $derived(`upi://pay?${params.toString()}`);
```

Every query parameter from the HTTPS URL passes through to the `upi://` URL verbatim. No validation, no transformation, no storage — just a transparent protocol bridge. It's a SvelteKit app with Tailwind CSS v4 and a Catppuccin Mocha theme, deployed to Cloudflare Pages. No backend, no database, zero runtime dependencies.

The whole thing took about an hour to build and saves me roughly ten seconds per payment. At this rate, it'll pay for itself in productivity gains sometime around the heat death of the universe. Worth it.

The source is at [github.com/adyavanapalli/ritu](https://github.com/adyavanapalli/ritu), and it's live at [payviaupi.link](https://payviaupi.link).

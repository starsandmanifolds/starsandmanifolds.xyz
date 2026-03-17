---
title: Stanislav Petrov Did Bayes' Theorem in His Head
excerpt: On 26 September 1983, Stanislav Petrov faced a Soviet missile alarm that might have triggered nuclear war. The crucial question was not how accurate the system was, but how likely a real launch was once the siren sounded.
tags: ["Mathematics", "Probability", "History", "Bayes"]
state: published
---

On 26 September 1983, Stanislav Petrov was the duty officer on shift at Serpukhov-15, a Soviet command center near Moscow that monitored the satellite early-warning system known as Oko. Its job was simple in principle and horrifying in practice: detect an American missile launch quickly enough for Soviet leadership to decide whether war had begun.

That night, Oko reported that the United States had launched one missile, then four more. Petrov judged the warning to be a false alarm and waited for corroboration that never came. He did not personally control any nuclear launch, but his assessment sat in a chain of decisions where being wrong in either direction could have been catastrophic.

People usually describe that decision as intuition, nerve, or luck. It was all of those things, probably. But it was also an instance of Bayesian reasoning under about as much pressure as a human nervous system can tolerate. Petrov did not merely ask whether the alarm system was good. He asked the much harder question: given that the alarm is going off right now, how likely is it that an American first strike is actually underway?

That may sound like a subtle distinction, but it is the distinction everything depends on.

## The Probability That Actually Matters

When someone says a detector is "99% accurate," they usually mean something like $P(S \mid L) = 0.99$, where we write $S :=$ "the siren sounds" and $L :=$ "there is an actual launch." This says that if a launch really is happening, the system catches it $99\%$ of the time. That is certainly an important engineering number, but it is not the number anyone in the bunker *should* care about. Once the siren is already screaming, the question is no longer "How often does the siren sound during a real launch?" The question is $P(L \mid S)$, which reads: given that the alarm has gone off, what are the odds this is real?

Those two probabilities look similar, but they are not interchangeable. One runs from the world to the evidence. The other runs from the evidence back to the world. The gap between them is the base rate: how common the underlying event was before the alarm ever sounded. If actual nuclear first strikes are fantastically rare, then even a very accurate warning system can spend most of its life producing false alarms, simply because there are so many more peaceful minutes than apocalyptic ones.

So this is the mathematical problem in front of us. The number the engineers naturally report is $P(S \mid L)$. The number the officer on shift actually needs is $P(L \mid S)$. Those are different quantities, and you do not get from one to the other by intuition alone. You need a rule that tells you how to reverse the conditional probability while correctly accounting for the base rate $P(L)$. That rule is Bayes' theorem.

## Bayes' Theorem

Bayes' theorem says that, as long as $P(S) > 0$,

$$
P(L \mid S) = \frac{P(S \mid L)P(L)}{P(S)}
$$

This is the compact form. In words:

- $P(L)$ is the probability that there is an actual launch; this is known as the prior
- $P(S \mid L)$ is the probability that, given there is an actual launch, the siren sounds; this is known as the likelihood
- $P(L \mid S)$ is the probability that, given the siren sounds, there is an actual launch; this is known as the posterior

The proof is straightforward once you write down what conditional probability means. We begin with

$$
P(L \mid S) = \frac{P(L \cap S)}{P(S)}
$$

because $P(L \mid S)$ means: what is the probability that a launch has occurred, given that the siren has already sounded? Once we know $S$ has happened, we are effectively working inside the smaller event space $S$, and within that space the favorable outcomes are exactly those in $L \cap S$.

Similarly,

$$
P(S \mid L) = \frac{P(L \cap S)}{P(L)}
$$

Now rearrange both equations so that the joint probability sits on one side:

$$
P(L \cap S) = P(L \mid S)P(S) \tag{1}
$$

and

$$
P(L \cap S) = P(S \mid L)P(L) \tag{2}
$$

Since both right-hand sides are equal to the same quantity $P(L \cap S)$, we get

$$
P(L \mid S)P(S) = P(S \mid L)P(L)
$$

Assuming $P(S) > 0$, divide through by $P(S)$:

$$
P(L \mid S) = \frac{P(S \mid L)P(L)}{P(S)} \tag{3}
$$

That proves Bayes' theorem.

## A More Useful Form

Equation (3) is correct, but it is not yet very useful computationally, because the denominator $P(S)$ is not usually known directly. What we are more likely to know are the probabilities of the siren sounding in the two underlying cases: when there is a launch and when there is not. If the siren sounds, those are the only two possibilities. So we can rewrite the denominator in equation (3) as

$$
P(S) = P(S \cap L) + P(S \cap \neg L)
$$

Applying the same identity as in equations (1) and (2), namely $P(X \cap Y) = P(X \mid Y)P(Y)$, to both terms gives

$$
P(S) = P(S \mid L)P(L) + P(S \mid \neg L)P(\neg L)
$$

Substituting that into the denominator yields the form that is usually most useful in practice:

$$
P(L \mid S) =
\frac{P(S \mid L)P(L)}
{P(S \mid L)P(L) + P(S \mid \neg L)P(\neg L)}
$$

## A Toy Early-Warning System

I do not know the exact confusion matrix of the Soviet Oko early-warning system, and public sources do not really know it either. The system was classified, the incident was messy, and different retellings emphasize different details. Fortunately, we do not need the exact historical numbers. Any nuclear early-warning system lives in the same statistical regime: real attacks are extraordinarily rare, while false alarms are merely uncommon.

So let us use a toy model. Suppose that in a given alert window the probability of an actual launch is $P(L) = 0.0001$, and the probability that the siren sounds given a real launch is $P(S \mid L) = 0.99$.

We also assume the system has $99\%$ specificity, which means

$$
P(\neg S \mid \neg L) = 0.99
$$

and therefore

$$
P(S \mid \neg L) = 1 - P(\neg S \mid \neg L) = 0.01.
$$

Finally, since either there is a launch or there is not,

$$
P(\neg L) = 1 - P(L) = 0.9999.
$$

This is already an alarmingly good detector. On paper, $99\%$ sensitivity and $99\%$ specificity for a problem this hard looks extraordinary. But the posterior is what matters, so let us compute it:

$$
P(L \mid S)
=
\frac{P(S \mid L)P(L)}{P(S \mid L)P(L) + P(S \mid \neg L)P(\neg L)}
$$

Substituting the values we derived above gives

$$
P(L \mid S)
=
\frac{\underbrace{0.99}_{P(S \mid L)} \cdot \underbrace{0.0001}_{P(L)}}{\underbrace{0.99}_{P(S \mid L)} \cdot \underbrace{0.0001}_{P(L)} + \underbrace{0.01}_{P(S \mid \neg L)} \cdot \underbrace{0.9999}_{P(\neg L)}}
$$

and hence

$$
P(L \mid S) \approx 0.0098
$$

So even after the alarm goes off, the probability of an actual attack is only about $0.98\%$. In other words, the system can be excellent in the usual engineering sense and still be mostly wrong at the exact instant a human being must decide what the alarm means.

The easiest way to feel this in your bones is to count cases. Out of $10{,}000$ such alert windows, you expect about one real attack, and in that case the detector raises a true alarm with probability $0.99$. But among the $9{,}999$ windows with no attack, a $1\%$ false-positive rate produces about $100$ false alarms. So the alarm stream is not one true warning surrounded by silence. It is one true warning buried in a pile of false ones.

That is the base-rate effect in one line: if the event is rare enough, false positives overwhelm true positives. When the system screams, the most likely explanation is not "civilization is ending." It is "the detector is wrong."

## Why Petrov Waited

Petrov later said several things pushed him toward skepticism. A real American first strike would probably not begin with just five missiles. The warning system was new. Ground radar had not yet confirmed anything. Those are often presented as pieces of military intuition, and they were, but they were also exactly the sort of considerations Bayes tells you to care about. He was looking for corroborating evidence strong enough to overcome the tiny prior probability $P(L)$.

You can see this mathematically if, as a toy idealization, you imagine a second independent warning channel producing a second siren event $S_2$ with the same performance as the first event $S_1$. The key assumption is conditional independence: given that there is a launch, the two warning channels behave independently, and given that there is no launch, they also behave independently. Under that assumption,

$$
P(L \mid S_1 \cap S_2)
=
\frac{0.99^2 \cdot 0.0001}{0.99^2 \cdot 0.0001 + 0.01^2 \cdot 0.9999}
\approx 0.495
$$

If a third independent warning channel $S_3$ also reports an alarm, then

$$
P(L \mid S_1 \cap S_2 \cap S_3)
=
\frac{0.99^3 \cdot 0.0001}{0.99^3 \cdot 0.0001 + 0.01^3 \cdot 0.9999}
\approx 0.9898
$$

The first alarm mostly tells you that one warning channel fired. The second starts to make you nervous. The third means you should be looking for a bunker with thicker walls.

Of course, real systems are not perfectly independent. Correlated failures are exactly what make them scary. In the 1983 incident itself, the false alarm was eventually traced to a rare alignment of sunlight on high-altitude clouds, interacting with the Oko satellites' Molniya orbits. That is exactly the kind of common cause that can fool more than one component of a system at once. Radar, satellites, human reporting chains, and political interpretation are all entangled. But that only strengthens the broader point: in rare-event detection, one alarming signal should not automatically dominate your beliefs. The prior matters, and corroboration matters because the first piece of evidence is usually fighting against a huge numerical disadvantage.

Petrov's move, then, was not "ignore the data." It was "one screaming sensor is not enough." That is a very different kind of skepticism. It is not anti-empirical. It is what correct empirical reasoning looks like when the stakes are monstrous.

## The Error People Keep Making

The classic mistake is to confuse $P(S \mid L)$ with $P(L \mid S)$. These are not the same thing, and in rare-event problems they can differ by orders of magnitude. A highly accurate alarm is not the same thing as a highly trustworthy alarm. The first quantity tells you how the detector behaves if the world is in a particular state. The second tells you what state the world is probably in after you have observed the detector. Bayes' theorem is the bridge between those questions, and the base rate sits right in the middle of that bridge, demanding to be accounted for.

Stanislav Petrov almost certainly did not write down Bayes' theorem in the bunker. He did something harder. He kept hold of the prior in a room specifically designed to make the prior feel irrelevant. He remembered, in effect, that a system can be impressive without being persuasive, and that one alarm is not the same thing as one war.

That may be the most important probabilistic instinct a human being has ever had.

And he likely saved the world as a result.

---
title: Why the Force on a Body Undergoing Circular Motion is Centripetal
excerpt: A mathematical derivation showing why circular motion requires a center-directed force, starting from the position vector and using Newton's laws.
tags: ["Physics", "Mathematics", "Classical Mechanics"]
state: published
---

When observing objects in circular motion, from planets orbiting the sun to electrons in particle accelerators, we find they all require a force directed toward the center of their circular path. This centripetal force is not a new type of force, but rather the net force required to maintain circular motion. Let's derive why this must be the case using vector calculus.

## Setting Up the Problem

Consider a particle moving in a circular path of radius $r$ with constant angular velocity $\omega$. We can describe its position using the vector:

$$
\vec{r}(t) = r\cos(\omega t)\hat{i} + r\sin(\omega t)\hat{j}
$$

where $\hat{i}$ and $\hat{j}$ are unit vectors in the $x$ and $y$ directions respectively.

## Finding the Velocity

To find the velocity, we differentiate the position vector with respect to time:

$$
\vec{v}(t) = \frac{d\vec{r}}{dt} = -r\omega\sin(\omega t)\hat{i} + r\omega\cos(\omega t)\hat{j}
$$

Note that the magnitude of velocity is $|\vec{v}| = r\omega$, which is constant, confirming uniform circular motion.

## Finding the Acceleration

Differentiating the velocity gives us acceleration:

$$
\begin{align*}
\vec{a}(t) &= \frac{d\vec{v}}{dt} \\
&= -r\omega^2\cos(\omega t)\hat{i} - r\omega^2\sin(\omega t)\hat{j} \\
&= -\omega^2[r\cos(\omega t)\hat{i} + r\sin(\omega t)\hat{j}] \\
&= -\omega^2\vec{r}(t)
\end{align*}
$$

, i.e. the acceleration vector is proportional to the negative of the position vector.

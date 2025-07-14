---
title: The Laplace Transform is Just the Continuous Analogue of a Power Series
excerpt: Exploring the deep connection between power series and the Laplace transform by extending discrete indices to continuous parameters.
tags: ["Mathematics", "Analysis", "Transforms"]
---

The Laplace transform is a fundamental tool in mathematics and engineering, but its connection to more elementary concepts isn't always clear. In this article, we'll show how the Laplace transform naturally emerges when we generalize the familiar power series from discrete to continuous indices.

## Starting with Power Series

A power series represents a function as an infinite sum of powers:

$$
F(x) = \sum_{n=0}^{\infty} f_n x^n
$$

where $f_n$ are the coefficients and $n \in \{0, 1, 2, \ldots\}$. This discrete representation has proven incredibly useful in analysis, but what happens if we allow the index to vary continuously?

## The Continuous Extension

Let's extend the index $n$ from discrete integers to a continuous parameter $t \in [0, \infty)$. This transforms:

- The discrete coefficients $f_n$ into a continuous function $f(t)$
- The summation $\sum$ into an integral $\int$

Our generalized "continuous power series" becomes:

$$
F(x) = \int_0^{\infty} f(t) x^t \, dt
$$

## Making the Connection to Laplace

To see how this relates to the Laplace transform, we rewrite $x^t$ using the exponential function:

$$
x^t = e^{t \ln x}
$$

Substituting this into our integral:

$$
F(x) = \int_0^{\infty} f(t) e^{t \ln x} \, dt
$$

For convergence, we need $x \in (0, 1)$, which means $\ln x < 0$. Let's make a substitution to clarify this structure. Setting $s = -\ln x$ (so $s > 0$ when $0 < x < 1$), we get:

$$
\int_0^{\infty} f(t) e^{-st} \, dt \triangleq \mathscr{L}\{f(t)\}(s)
$$

This is precisely the Laplace transform of $f(t)$!

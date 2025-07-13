---
title: The Laplace Transform is Just the Continuous Analogue of a Power Series
excerpt: A derivation showing why the Laplace Transform can be thought of as a continuous analogue of a power series.
tags: ["Mathematics"]
---

The power series for the function $F(x)$ is given by:
$$
F(x) = \sum_{n=0}^{\infty} f_n x^n
$$
, where $f_n$ are the coefficients of the series. Here, $n$ takes on integer values greater than or equal to 0.

Suppose now that we take $n$ from a continuous domain, say $[0, \infty)$. We relabel $n$ as $t$ and $f_t$ as $f(t)$ and transform the summation into an integral:

$$
F(x) = \int_0^{\infty} f(t) x^t \, dt
$$

If we rewrite $x^t$ as an exponential, we get $x^t = e^{t \ln x}$, so the integral becomes:

$$
F(x) = \int_0^{\infty} f(t) e^{t \ln x} \, dt
$$

As we require the integral to converge, we must have $x \in (0, 1)$. Since the expression $\ln(x)$ in that interval is negative, we relabel $\ln x$ as $-s$:

$$
F(x) = \int_0^{\infty} f(t) e^{-st} \, dt
$$

, which is the definition of the Laplace Transform of $f(t)$. $\square$

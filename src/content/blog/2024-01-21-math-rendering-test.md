---
title: Mathematics Rendering Test
date: 2024-01-21
excerpt: Testing LaTeX math rendering with various mathematical expressions and equations.
tags: ["Mathematics", "Test", "LaTeX"]
---

This post tests the LaTeX math rendering capabilities using KaTeX with rehype-katex-svelte.

## Inline Math

Here's some inline math: $E = mc^2$ and $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$.

We can also write more complex inline expressions like $\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$.

## Display Math

### Basic Equations

The quadratic formula:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

### Calculus

The definition of a derivative:

$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

Integration by parts:

$$\int u \, dv = uv - \int v \, du$$

### Linear Algebra

Matrix multiplication:

$$\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix} = 
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}$$

### Complex Analysis

Euler's formula:

$$e^{i\theta} = \cos\theta + i\sin\theta$$

When $\theta = \pi$:

$$e^{i\pi} + 1 = 0$$

### Physics

The Schrödinger equation:

$$i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t) = \hat{H}\Psi(\mathbf{r},t)$$

### Using Custom Macros

Here we use some predefined macros:

- Real numbers: $\RR$
- Complex numbers: $\CC$ 
- Natural numbers: $\NN$
- Integers: $\ZZ$
- Vector notation: $\vec{F} = m\vec{a}$

## Conclusion

If all these equations render correctly without any Svelte template errors, then LaTeX math support is working properly!
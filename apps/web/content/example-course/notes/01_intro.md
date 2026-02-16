# Introduction to Example Course

## What is this?

This is a **demo course** showing how the platform renders content. The actual course summaries are private and not included in this repository.

## Math Rendering

Inline math: $E = mc^2$

Display math:

$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

## Admonitions

!!! info "Information"
    This is an info box rendered from MkDocs syntax.

!!! warning "Warning"
    This is a warning box.

!!! tip "Tip"
    Tips are rendered with a different color.

## Tables

| Feature | Status |
|---------|--------|
| Hebrew RTL | Supported |
| Math (KaTeX) | Supported |
| Code highlighting | Supported |
| Admonitions | Supported |

## Code

```python
def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

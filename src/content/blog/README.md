# Adding Blog Posts

To add a new blog post:

1. Create a new Markdown file in this directory (`src/content/blog/`)
2. Name it using the format: `YYYY-MM-DD-your-post-slug.md`
   - Example: `2024-01-20-understanding-rust-ownership.md`
3. Add front matter at the top of the file:

   ```md
   ---
   title: Your Blog Post Title
   excerpt: A brief description of your blog post that will appear in the blog list.
   tags: ["Tag1", "Tag2", "Tag3"]
   publish: true
   ---
   ```

4. Write your content in Markdown below the front matter:

   ```markdown
   Your introduction paragraph...

   ## Section Heading

   Content...

   ```

## Front Matter Fields

- `title` (required): The title of your blog post
- `excerpt` (required): A brief description shown in the blog list
- `tags` (required): An array of tags for categorization
- `publish` (required): Boolean to control visibility (set to `true` to make the post visible)

**Note**: The publication date is automatically extracted from the filename (YYYY-MM-DD format).

## Markdown Features

You can use all standard Markdown features:

- **Bold text**
- *Italic text*
- `Inline code`
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Links
- Images
- Tables
- Blockquotes

## LaTeX Math Support

You can include mathematical equations using LaTeX syntax:

### Inline Math

Use single dollar signs for inline math: `$E = mc^2$` renders as $E = mc^2$

### Display Math

Use double dollar signs for display math:

```latex
$$
\frac{x}{y} = \frac{a}{b}
$$
```

### Available Macros

The following LaTeX macros are predefined:

- `\vec{F}` for bold vectors
- `\RR` for real numbers (ℝ)
- `\CC` for complex numbers (ℂ)
- `\NN` for natural numbers (ℕ)
- `\ZZ` for integers (ℤ)

### Examples

- Inline: `$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$`
- Display: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`
- Vectors: `$\vec{F} = m\vec{a}$`
- Sets: `$x \in \RR$`

## Example

See the existing blog posts in this directory for examples of the format and structure.

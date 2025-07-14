# starsandmanifolds.xyz

This is the source code for my personal blog, [starsandmanifolds.xyz](https://starsandmanifolds.xyz). It's a place where I write about software engineering, mathematics, physics, and other topics that I find interesting.

## Blog

Blog posts are written in Markdown and stored in the `src/content/blog` directory. Each post includes front matter for metadata like the title, excerpt, and tags. The content itself can include standard Markdown, as well as LaTeX for mathematical notation.

For detailed instructions on how to add a new blog post, see the [blog content README](./src/content/blog/README.md).

## Development

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/starsandmanifolds/starsandmanifolds.xyz
   ```

2. Install NPM packages

   ```sh
   npm install
   ```

### Usage

To start the development server, run:

```bash
npm run dev
```

This will start the development server on `http://localhost:5173`.

To build the project for production, run:

```bash
npm run build
```

This will create a production-ready build in the `.svelte-kit` directory. The build output currently targets deployment on [Cloudflare Pages](https://pages.cloudflare.com/), which is configured in the `svelte.config.js` file with an adapter. If you want to build for deployment to another platform, you'll need to find the appropriate adapter in the [SvelteKit documentation](https://kit.svelte.dev/docs/adapters).

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

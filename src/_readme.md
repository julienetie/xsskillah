# XssKillah (Work in Progress)

## A Fast Minimal DOM-based HTML Sanitizer

XssKillah is a lightweight and fast HTML sanitizer designed for securing components and content delivery. While it comes with opinionated defaults for high protection, it offers flexibility for various real-world use cases.

### Features

- **{{ size }} minified** | **{{ brotliSize }}** _(brotli)_
- Minimal allowed markup by default for enhanced security
- Fast _(Outperforms generic sanitizers like DomPurify and Sanitize-HTML)_
- Sanitizes against a real DOM (not RegEx)
- Cleans dangerous URLs
- No need for escaping _(Textual content is encapsulated in Text-nodes)_
- Whitelist opt-in for dangerous tags, attributes, and known vulnerable combinations

### Philosophy

XssKillah follows a highly opinionated approach by disallowing as many vulnerable tags and attributes as possible. This minimalistic design keeps XssKillah small, ensuring fast performance. It offers clarity, allowing you to understand the risks as you enable specific features.

### Restrictions

In theory, there are no restrictions on what can be rendered. XssKillah is an opt-in sanitizer, meaning that rendered script tags will not execute unless explicitly allowed.

### API

The API details are still a work in progress and will be announced soon.

### License

MIT © Julien Etienne 2024

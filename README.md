# XssKillah (Work in Progress)

## A Fast Minimal DOM-based HTML Sanitizer

XssKillah is a lightweight and fast HTML sanitizer designed for securing components and content delivery. While it comes with opinionated defaults for high protection, it offers flexibility for various real-world use cases.

### Features

- **2.11KB minified** | **957 bytes** _(brotli)_
- Minimal allowed markup by default for enhanced security
- Fast _(Outperforms generic sanitizers like DomPurify and Sanitize-HTML)_
- Sanitizes against a real DOM (not RegEx)
- Cleans dangerous URLs
- No need for escaping _(Textual content is encapsulated in Text-nodes)_
- Whitelist opt-in for dangerous tags, attributes, and known vulnerable combinations

### Philosophy

XssKillah follows a highly opinionated approach by justifiably disallowing vulnerable tags and attributes that fall outside of common working scopes.
This minimalistic design keeps XssKillah small, ensuring fast performance. It offers clarity, allowing you to understand the risks as you enable specific features.

#### Filtered tags
By default, the following tags are ignored and should be explicitly opted-in, preferably at a component level using the allowTags option.
- script
- iframe
- object
- embed
- meta
- base
- style
- canvas
- link
- marquee
- applet
- frame
- frameset

#### Inactive Scripts
Scripts are inactive by default, but can be made active in a safe manner by the use of `xssKillah.makeAlive()`. _(script needs to be included using allowTags)_


#### Text Nodes
Escaping is not necessary since text is written to the sandbox DOM first. Consequently, XssKillah only requires processing of element tags and their content enclosed within.

#### Iframes
The iframe src atttribute is sanitized. The implementor (You or your team) are responsible for ensuring the source of the iframe is trustworthy.

### Restrictions
In theory, there are no restrictions on what can be rendered. XssKillah is an opt-in sanitizer.

### API

The API details are still a work in progress and will be announced soon.

### License

MIT © Julien Etienne 2024

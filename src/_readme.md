# XssKillah (Work in Progress)

## A Fast Minimal DOM based HTML Sanitizer

XssKillah is an opinionated but forgiving sanitizer oriented around component and content delivery.
The defaults are opinionated but it features as much flexability as required for the majority of real-world use cases.


### XssKillah
- {{ size }} minified | {{ brotliSize }} _(brotli)_
- Minimal allowed markup features by default for high protection
- Fast _( Faster than generic sanitizers such as DomPurify and Sanitize-HTML)_
- Sanitizes against a real DOM (not RegEx)
- Cleans dangerous URLs
- No need for escaping _(Textual content is encapuslated in Text-nodes)_
- Whitelist opt-in when using dangerous tags, attributes and known vulenrable combinations.


### Philosophy
XssKillah adopts a highly opinionated approach, disallowing as many vulnerable tags and attributes as reasonably possible. This minimalistic design keeps XssKillah small and ensures fast performance. It also provides clarity, allowing you to understand the risks as you enable specific features.

### Restrictions
In theory, there shouldn't be any restrictions on what can be rendered. 
This is an opt-in sanitizer. E.g. Renered script tags will not execute unless you explicitly allow them to.

### API
To be announced (TBA), still work in progress.

MIT © Julien Etienne 2024

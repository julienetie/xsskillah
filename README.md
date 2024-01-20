# ParserBy (Work in Progress)

## A Fast Minimal HTML Sanitizer

ParserBy is a sanitizer primarily designed for typical workflows, offering additional options to enable or disable vulnerable HTML features at a global or instance level.

### Philosophy
ParserBy adopts a highly opinionated approach, disallowing as many vulnerable tags and attributes as reasonably possible. This minimalistic design keeps ParserBy small and ensures fast performance. It also provides clarity, allowing you to understand the risks as you enable specific features.

### Restrictions
In theory, there shouldn't be any restrictions on what can be rendered. Script tags will not be executed even if initially rendered. To execute scripts, you'll need to use `parserby.reviveScript('selector', text)`.

### API
To be announced (TBA)

Apache 2.0 © Julien Etienne 2024

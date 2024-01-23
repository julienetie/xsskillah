const globalDefaults = {
  allowTags: [], // Allow dangerous tags
  allowTagRules: [] // Allow dangerous tag rules
  /*
          - inputTypeJS           ->      Allow inputMarkup type to be text/javascript
          - formAction            ->      Allow form ation attribute
          - strayDoubleQuotes     ->      Allow stray double quotes
          - straySingleQuotes     ->      Allow stray single quotes
          - strayBackTicks        ->      Allow stray back ticks
      */
};

const doc = document.implementation.createHTMLDocument();

/*
Taken from Angular
- https://github.com/angular/angular/blob/bbbe477f479f20722f0fea7ccc46095aad5d4253/packages/core/src/sanitization/url_sanitizer.ts#L38
*/
const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i; // eslint-disable-line

/*
Taken from Angular
- https://github.com/angular/angular/blob/bbbe477f479f20722f0fea7ccc46095aad5d4253/packages/core/src/sanitization/url_sanitizer.ts#L39
*/
const sanitizeUrl = url => {
  url = String(url);
  return url.match(SAFE_URL_PATTERN) ? url : 'unsafe:' + url
};

const vulnerableAttributes = ['href', 'src', 'srcset', 'style', 'background', 'action', 'formaction', 'xmlns'];

const vulnerableTags = [
  'script',
  'iframe',
  'object',
  'embed',
  'meta',
  'base',
  'style',
  'canvas',
  'link',
  'marquee',
  'applet',
  'frame',
  'frameset'
];

const xsskillah = (inputMarkup, instanceOptions, globalOptions) => {
  const treeWalker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const allowTagRulesObj = {};
  const ignoreNodes = [];
  let node;

  // Put html in doc
  doc.body.innerHTML = inputMarkup;

  // Instance Options > Global Options > Global Defaults.
  const allowTags = instanceOptions?.allowTags || globalOptions?.allowTags || globalDefaults.allowTags;
  const allowTagRules = instanceOptions?.allowTagRules || globalOptions?.allowTagRules || globalDefaults.allowTagRules;

  // Set allowed tag rules object.
  for (const value of allowTagRules) allowTagRulesObj[value] = true;

  // Vulnerable tags are ignored by default unless overriden by the global options or an instance option.
  const vulnerableTagsFiltered = vulnerableTags.filter(tag => !(allowTags).includes(tag));

  // Remove filtered vulnerable tags
  vulnerableTagsFiltered.forEach(tag => {
    const tags = doc.body.querySelectorAll(tag);
    tags.forEach(t => t.remove());
  });

  // eslint-disable-next-line
  while (node = treeWalker.nextNode()) {
    // Skip if node should be ignored
    const indexOfNodeToIgnore = ignoreNodes.indexOf(node);
    if (indexOfNodeToIgnore > -1) {
      // eslint-disable-next-line
      ignoreNodes.splice(indexOfNodeToIgnore, 1);
      continue
    }

    const name = node.nodeType;

    switch (name) {
      case 1: // Element
        for (const attr of node.attributes) {
          const value = attr.value;
          const key = attr.name;

          // Vulnerable input
          if (name === 'input' && key === 'type' && value === 'text/javascript' && allowTagRulesObj.inputTypeJS) {
            node.remove(); // Can remove as input has no children
          }

          // Action disabled by default
          if (name === 'form' && key === 'action' && allowTagRulesObj.formAction) {
            const formChildren = node.querySelectorAll('*');
            ignoreNodes.push(...formChildren);
            node.remove();
          }

          // Remove on* events or sanitize on* event urls
          if (key.startsWith('on') && !allowTagRulesObj.onEvents) {
            node.removeAttribute(key);
          } else {
            attr.value = sanitizeUrl(value);
          }

          // Stray double quotes, single quotes and back ticks will be removed
          const strayDouble = key.startsWith('"') && !allowTagRulesObj.strayDoubleQuotes;
          const straySingle = key.startsWith('\'') && !allowTagRulesObj.straySingleQuote; // @todo not recognising single quotes
          const strayBackTick = key.startsWith('`') && !allowTagRulesObj.strayBackTicks;

          if (strayDouble || straySingle || strayBackTick) {
            node.removeAttribute(key);
          }

          // Sanitize dangerous attributes
          if (vulnerableAttributes.includes(key) || key.startsWith('data')) {
            attr.value = sanitizeUrl(value);
          }
        }
        break
    }
  }

  return doc.body
};

export { xsskillah as default };
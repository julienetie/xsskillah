 // Copied from Sanitize-HTML: https://github.com/apostrophecms/sanitize-html/blob/main/index.js
 const nonBooleanAttributes = [
  'abbr', 'accept', 'accept-charset', 'accesskey', 'action',
  'allow', 'alt', 'as', 'autocapitalize', 'autocomplete',
  'blocking', 'charset', 'cite', 'class', 'color', 'cols',
  'colspan', 'content', 'contenteditable', 'coords', 'crossorigin',
  'data', 'datetime', 'decoding', 'dir', 'dirname', 'download',
  'draggable', 'enctype', 'enterkeyhint', 'fetchpriority', 'for',
  'form', 'formaction', 'formenctype', 'formmethod', 'formtarget',
  'headers', 'height', 'hidden', 'high', 'href', 'hreflang',
  'http-equiv', 'id', 'imagesizes', 'imagesrcset', 'inputmode',
  'integrity', 'is', 'itemid', 'itemprop', 'itemref', 'itemtype',
  'kind', 'label', 'lang', 'list', 'loading', 'low', 'max',
  'maxlength', 'media', 'method', 'min', 'minlength', 'name',
  'nonce', 'optimum', 'pattern', 'ping', 'placeholder', 'popover',
  'popovertarget', 'popovertargetaction', 'poster', 'preload',
  'referrerpolicy', 'rel', 'rows', 'rowspan', 'sandbox', 'scope',
  'shape', 'size', 'sizes', 'slot', 'span', 'spellcheck', 'src',
  'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style',
  'tabindex', 'target', 'title', 'translate', 'type', 'usemap',
  'value', 'width', 'wrap',
  // Event handlers
  'onauxclick', 'onafterprint', 'onbeforematch', 'onbeforeprint',
  'onbeforeunload', 'onbeforetoggle', 'onblur', 'oncancel',
  'oncanplay', 'oncanplaythrough', 'onchange', 'onclick', 'onclose',
  'oncontextlost', 'oncontextmenu', 'oncontextrestored', 'oncopy',
  'oncuechange', 'oncut', 'ondblclick', 'ondrag', 'ondragend',
  'ondragenter', 'ondragleave', 'ondragover', 'ondragstart',
  'ondrop', 'ondurationchange', 'onemptied', 'onended',
  'onerror', 'onfocus', 'onformdata', 'onhashchange', 'oninput',
  'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup',
  'onlanguagechange', 'onload', 'onloadeddata', 'onloadedmetadata',
  'onloadstart', 'onmessage', 'onmessageerror', 'onmousedown',
  'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout',
  'onmouseover', 'onmouseup', 'onoffline', 'ononline', 'onpagehide',
  'onpageshow', 'onpaste', 'onpause', 'onplay', 'onplaying',
  'onpopstate', 'onprogress', 'onratechange', 'onreset', 'onresize',
  'onrejectionhandled', 'onscroll', 'onscrollend',
  'onsecuritypolicyviolation', 'onseeked', 'onseeking', 'onselect',
  'onslotchange', 'onstalled', 'onstorage', 'onsubmit', 'onsuspend',
  'ontimeupdate', 'ontoggle', 'onunhandledrejection', 'onunload',
  'onvolumechange', 'onwaiting', 'onwheel'
]


const sandboxes = new Set()


const globalDefaults = {
  allowTags: [], // Allow dangerous tags
  allowTagRules: [], // Allow dangerous tag rules
  xssDocReset: 8
  /*
          - inputTypeJS           ->      Allow inputMarkup type to be text/javascript
          - formAction            ->      Allow form ation attribute
          - strayDoubleQuotes     ->      Allow stray double quotes
          - straySingleQuotes     ->      Allow stray single quotes
          - strayBackTicks        ->      Allow stray back ticks
      */
}

/* 
xssDoc is repurposed */
const xssDoc = document.implementation.createHTMLDocument()

/*
Taken from Angular
- https://github.com/angular/angular/blob/bbbe477f479f20722f0fea7ccc46095aad5d4253/packages/core/src/sanitization/url_sanitizer.ts#L38
*/
const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i // eslint-disable-line

/*
Taken from Angular
- https://github.com/angular/angular/blob/bbbe477f479f20722f0fea7ccc46095aad5d4253/packages/core/src/sanitization/url_sanitizer.ts#L39
*/
const sanitizeUrl = url => {
  url = String(url)
  return url.match(SAFE_URL_PATTERN) ? url : 'unsafe:' + url
}

const vulnerableAttributes = ['href', 'src', 'srcset', 'style', 'background', 'action', 'formaction', 'xmlns']

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
]

const xssKillah = (globalOptions = {}) => (inputMarkup, instanceOptions) => {
 /*
  xssDocReset determines when xssKillah should remove the sandbox elements after usage. This is to improve performance.
  Larger inputs may benefit from more frequent resets. Frequent inputs may benefit from infrequent resets. 
  */
  {
    const xssDocReset = Object.hasOwn(globalOptions, 'xssDocReset') ? globalOptions.xssDocReset : globalDefaults.xssDocReset
    if (sandboxes.size === xssDocReset) {
      for (const sandboxRef of sandboxes) {
        const sandbox = sandboxRef.deref()
        sandbox.remove()
      }
      sandboxes.clear()
    }
    console.log(xssDoc.body, sandboxes)
  }
  const treeWalker = document.createTreeWalker(xssDoc.body, NodeFilter.SHOW_ELEMENT)
  const allowTagRulesObj = {}
  const ignoreNodes = []
  let node

  const sandbox = document.createElement('div')
  xssDoc.body.appendChild(sandbox)
  sandbox.innerHTML = inputMarkup
  const sandboxRef = new WeakRef(sandbox)
  sandboxes.add(sandboxRef)


  // Instance Options > Global Options > Global Defaults.
  const allowTags = instanceOptions?.allowTags || globalOptions?.allowTags || globalDefaults.allowTags
  const allowTagRules = instanceOptions?.allowTagRules || globalOptions?.allowTagRules || globalDefaults.allowTagRules

  // Set allowed tag rules object.
  for (const value of allowTagRules) allowTagRulesObj[value] = true

  // Vulnerable tags are ignored by default unless overriden by the global options or an instance option.
  const vulnerableTagsFiltered = vulnerableTags.filter(tag => !(allowTags).includes(tag))

  // Remove filtered vulnerable tags
  vulnerableTagsFiltered.forEach(tag => {
    const tags = sandbox.querySelectorAll(tag)
    tags.forEach(t => t.remove())
  })

  // eslint-disable-next-line
  while (node = treeWalker.nextNode()) {
    // Skip if node should be ignored
    const indexOfNodeToIgnore = ignoreNodes.indexOf(node)
    if (indexOfNodeToIgnore > -1) {
      // eslint-disable-next-line
      ignoreNodes.splice(indexOfNodeToIgnore, 1)
      continue
    }

    const name = node.nodeType

    switch (name) {
      case 1: // Element
        for (const attr of node.attributes) {
          const value = attr.value
          const key = attr.name

          // Vulnerable input
          if (name === 'input' && key === 'type' && value === 'text/javascript' && allowTagRulesObj.inputTypeJS) {
            node.remove() // Can remove as input has no children
          }

          // Action disabled by default
          if (name === 'form' && key === 'action' && allowTagRulesObj.formAction) {
            const formChildren = node.querySelectorAll('*')
            ignoreNodes.push(...formChildren)
            node.remove()
          }

          // Remove on* events or sanitize on* event urls
          if (key.startsWith('on') && !allowTagRulesObj.onEvents) {
            node.removeAttribute(key)
          } else {
            attr.value = sanitizeUrl(value)
          }

          // Stray double quotes, single quotes and back ticks will be removed
          const strayDouble = key.startsWith('"') && !allowTagRulesObj.strayDoubleQuotes
          const straySingle = key.startsWith('\'') && !allowTagRulesObj.straySingleQuote // @todo not recognising single quotes
          const strayBackTick = key.startsWith('`') && !allowTagRulesObj.strayBackTicks

          if (strayDouble || straySingle || strayBackTick) {
            node.removeAttribute(key)
          }

          // Sanitize dangerous attributes
          if (vulnerableAttributes.includes(key) || key.startsWith('data')) {
            attr.value = sanitizeUrl(value)
          }
        }
        break
    }
  }

  return sandbox.childNodes
}

export default xssKillah

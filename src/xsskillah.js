/*
htmlparser2 is used for parsing HTML openingTags, text and closingTags. */
import { Parser } from '../libs/html-parser-2.js'

const empty = ''
let output = empty

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
}

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

/*
We use `template` so we can convert the output to a DOM tree for further manpulation.
Primarily to mark and insert textNodes. */
const template = document.createElement('template')
const div = document.createElement('div')
template.appendChild(div)

/*
Searches a detatched DOM tree for matching text. It's expensive but likely to be edge cases.
- parentElement
- searchText
- replacementText
- Return
*/
const replaceTextInElement = (parentElement, searchText, replacementText) => {
  for (const node of parentElement.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = node.nodeValue.replace(new RegExp(searchText, 'g'), replacementText)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      replaceTextInElement(node, searchText, replacementText)
    }
  }
}

/*
The xssKillah function which takes markup (HTML/SVG@todo beta) and returns a detatched DOM tree.
- inputMarkup
- instanceOptions
- globalOptions
*/
const xsskillah = (inputMarkup, instanceOptions, globalOptions) => {
  /*
    The precidence is:
    Instance Options > Global Options > Global Defaults */
  const allowTags = instanceOptions?.allowTags || globalOptions?.allowTags || globalDefaults.allowTags
  const allowTagRules = instanceOptions?.allowTagRules || globalOptions?.allowTagRules || globalDefaults.allowTagRules

  const allowTagRulesObj = {}
  for (const value of allowTagRules) allowTagRulesObj[value] = true

  // Vulnerable attributes will be sanitized.
  const vulnerableAttributes = ['href', 'src', 'srcset', 'style', 'background', 'action', 'formaction', 'xmlns']

  // Vulnerable tags are ignored by default unless overriden by the global options or an instance option.
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
  ].filter(tag => !(allowTags).includes(tag))

  let count = -1
  let textId
  const textReg = new Map()

  /*
    Iterates each DOM block */
  const parserHandler = {
    onopentag (name, attributes) {
      if (vulnerableTags.includes(name)) return
      let skipTag = false
      let stringAttributes = empty
      for (let [key, value] of Object.entries(attributes)) {
        // Vulnerable inputMarkup
        if (name === 'inputMarkup' && key === 'type' && value === 'text/javascript' && allowTagRulesObj.inputTypeJS) return (skipTag = true)

        // Action disabled by default
        if (name === 'form' && key === 'action' && allowTagRulesObj.formAction) return (skipTag = true)

        // on* events
        if (key.startsWith('on') && !allowTagRulesObj.onEvents) {
          continue
        } else {
          value = sanitizeUrl(value)
        }
        // Stray double quotes
        if (key.startsWith('"') && !allowTagRulesObj.strayDoubleQuotes) return (skipTag = true)

        // Stray single quotes
        if (key.startsWith('\'') && !allowTagRulesObj.straySingleQuotes) return (skipTag = true)

        // Stray back ticks
        if (key.startsWith('`') && !allowTagRulesObj.strayBackTicks) return (skipTag = true)

        // Sanitize dangerous attributes
        if (vulnerableAttributes.includes(key) || key.startsWith('data-')) {
          value = sanitizeUrl(value)
        }

        if (value === empty) {
          stringAttributes += `${key} `
        } else {
          stringAttributes += `${key}="${value}" `
        }
      }
      if (skipTag) return

      output += `<${name} ${stringAttributes}>`
    },
    ontext (text) {
      count++
      textId = Math.floor(performance.now()) + count

      const id = `text-${textId}`
      textReg.set(id, text)
      output += `<ins id="${id}"></ins>`
    },
    oncomment (comment) {
      console.log(`<!-- ${comment} -->`)
      console.log()
      if (comment.includes('\n')) {
        output += `<!--${comment}-->`
      } else {
        output += `<!--${comment}-->`
      }
    },
    onclosetag (name) {
      if (vulnerableTags.includes(name)) return

      output += `</${name}>`
    }
  }

  const parser = new Parser(parserHandler)
  parser.write(inputMarkup)
  parser.end()

  /*
    Replaces marked text. Text that was marked with <ins> tags are found and replaced. */
  template.firstElementChild.insertAdjacentHTML('afterbegin', output)
  for (const [key, value] of textReg) {
    const span = template.firstElementChild.querySelector(`#${key}`)
    if (span) {
      span.insertAdjacentText('beforebegin', value)
      span.remove()
    } else {
      // If ins selectors are not found, search for the text.
      replaceTextInElement(template.firstElementChild, `<ins id="${key}"></ins>`, value)
    }
  }

  return template.firstElementChild.firstElementChild
}

export default xsskillah

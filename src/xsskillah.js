// RESOURCE_URL




/* 
We use htmlparser2 for parsing HTML openingTags, text and closingTags.
- 
*/
import { Parser } from '../libs/html-parser-2.js'

const empty = ''
let output = empty


/*
Taken from Angular
- https://github.com/angular/angular/blob/bbbe477f479f20722f0fea7ccc46095aad5d4253/packages/core/src/sanitization/url_sanitizer.ts#L38
*/
const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i


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
Primarily to mark and insert textNodes.
*/
const template = document.createElement('template')
const div = document.createElement('div')
template.appendChild(div)


const replaceTextInElement = (rootElement, searchText, replacementText) => {
    // Iterate through child nodes of the root element
    for (let node of rootElement.childNodes) {
        // If the current node is a text node
        if (node.nodeType === Node.TEXT_NODE) {
            // Replace the text within the text node
            node.nodeValue = node.nodeValue.replace(new RegExp(searchText, 'g'), replacementText);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recursively call the function for child elements
            replaceTextInElement(node, searchText, replacementText);
        }
    }
}


const globalDefaults = {
    allowTags: [], // Allow dangerous tags
    allowTagRules: [] // Allow dangerous tag rules 
    /* 
        - inputTypeJS           ->      Allow input type to be text/javascript
        - formAction            ->      Allow form ation attribute
        - strayDoubleQuotes     ->      Allow stray double quotes
        - straySingleQuotes     ->      Allow stray single quotes
        - strayBackTicks        ->      Allow stray back ticks
    */
}

const xsskillah = (input, instanceOptions, globalOptions) => {
    /*
    Instance Options > Global Options > Global Defaults */
    const allowTags = instanceOptions?.allowTags || globalOptions?.allowTags || globalDefaults.allowTags
    const allowTagRules = instanceOptions?.allowTagRules || globalOptions?.allowTagRules || globalDefaults.allowTagRules



    const allowTagRulesObj = {}
    for (const value of allowTagRules) allowTagRulesObj[value] = true


    // These attributes will be sanitized
    const dangerousAttributes = ['href', 'src', 'srcset', 'style', 'background', 'action', 'formaction', 'xmlns']

    const dangerousTags = [
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
        'frameset',
    ].filter(tag => !(allowTags).includes(tag))


    let count = -1
    let textId
    let textReg = new Map()
    const parser = new Parser({
        onopentag(name, attributes) {
            if (dangerousTags.includes(name)) return
            let skipTag = false
            let stringAttributes = empty
            for (let [key, value] of Object.entries(attributes)) {
                // Vulnerable input
                if (name === 'input' && key === 'type' && value === 'text/javascript' && allowTagRulesObj.inputTypeJS) return (skipTag = true)

                // Action disabled by default
                if (name === 'form' && key === 'action' && allowTagRulesObj.formAction) return (skipTag = true)

                // on* events 
                if (key.startsWith('on') && !allowTagRulesObj.onEvents) {
                    continue
                } else{
                    value = sanitizeUrl(value)
                }
                // Stray double quotes
                if (key.startsWith('"') && !allowTagRulesObj.strayDoubleQuotes) return (skipTag = true)

                // Stray single quotes
                if (key.startsWith('\'') && !allowTagRulesObj.straySingleQuotes) return (skipTag = true)

                // Stray back ticks
                if (key.startsWith('\`') && !allowTagRulesObj.strayBackTicks) return (skipTag = true)


                // Sanitize dangerous attributes
                if (dangerousAttributes.includes(key) || key.startsWith('data-')) {
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
        ontext(text) {
            count++
            textId = Math.floor(performance.now()) + count

            const id = `text-${textId}`
            textReg.set(id, text)
            output += `<ins id="${id}"></ins>`
        },
        onclosetag(name) {
            if (dangerousTags.includes(name)) return

            output += `</${name}>`
        },
    })


    parser.write(input)
    parser.end()


    template.firstElementChild.insertAdjacentHTML('afterbegin', output)
    for (let [key, value] of textReg) {
        const span = template.firstElementChild.querySelector(`#${key}`)
        if (span) {
            span.insertAdjacentText('beforebegin', value)
            span.remove()
        } else {
            replaceTextInElement(template.firstElementChild, `<ins id="${key}"></ins>`, value)
        }
    }

    return template.firstElementChild.firstElementChild
}

export default xsskillah

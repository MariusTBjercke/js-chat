import * as Controller from './controller';
import { chat } from './model';
let app = document.querySelector("#app");

show('home');
function show(page) {
    if (page) chat.app.currentPage = page;
    let currentPage = chat.app.currentPage;

    app.innerHTML = '';

    switch (currentPage) {
        case 'home':
            showFrontPage();
            break;

        case 'login':
            showLogin();
            break;

        default:
            break;
    }

}

function showFrontPage() {

    let wrapper = cr('div', app, 'class wrapper');

    let click = cr('h1', wrapper, 'class header', 'Hello world');
    click.onclick = () => {
    }

}

function showLogin() {

    let wrapper = cr('div', app, 'class wrapper');

}

/**
 * Similar to the createElement function, but refactored for this app.
 * @param {string} tagName The name of an element.
 * @param {HTMLElement} parent Parent element for this new child element.
 * @param {string} attr The first word in the beginning of a sentence before and after comma will be the attribute type, the following words (separated by empty spaces) before the optional next comma will be the attribute value(s). Example: class red rectangle,id header
 * @param {html} html HTML for innerHTML.
 * @returns {HTMLElement}
 */
 function cr(tagName, parent, attr, html) {
    const element = document.createElement(tagName);
    if (html) element.innerHTML = html;
    if (attr) {
        let sentences = attr.split(",");
        sentences.forEach(sentence => {
            let words = sentence.trim().split(" ");
            let word1 = words.shift();
            let word2 = words.join(" ");
            element.setAttribute(word1, word2);
        });
    }
    if (parent) parent.appendChild(element);
    return element;
}
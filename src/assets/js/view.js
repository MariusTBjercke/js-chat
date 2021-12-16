import * as Controller from './controller';
import { chat } from './model';
let app = document.querySelector("#app");

show('frontpage');
function show(page) {
    if (page) chat.app.currentPage = page;
    
    // Authentication
    Controller.auth();

    app.innerHTML = '';
    
    switch (chat.app.currentPage) {
        case 'frontpage':
            showFrontPage();
            break;

        case 'login':
            showLogin();
            break;

        default:
            showFrontPage();
            break;
    }

}

function showFrontPage() {

    // Update user last seen status every x ms
    // This would normally be done with a background task/cron job (?)
    setInterval(() => {
        Controller.setLastSeen(chat.app.currentUser);
        Controller.checkUsers();
    }, 5000);

    let wrapper = cr('div', app, 'class wrapper');

    let container = cr('div', wrapper, 'class container frontpage');

    let headerRow = cr('div', container, 'class header');
    let header = cr('h1', headerRow, '', 'Live Chat');

    let chatContainer = cr('div', container, 'class chat-container');

    let participantsContainer = cr('div', chatContainer, 'class participants');
    let participantsHeader = cr('h3', participantsContainer, '', 'Deltagere');
    let participants = cr('div', participantsContainer, 'class list');
    Controller.listChatParticipants(participants);

    let chatWindow = cr('div', chatContainer, 'class chat-window');
    let chatMessages = cr('div', chatWindow, 'class messages');
    Controller.listMessages(chatMessages, chatWindow);

    let compose = cr('div', chatContainer, 'class compose');
    let textarea = cr('textarea', compose, '');
    textarea.addEventListener('keydown', (e) => {
        Controller.keyDown(e, textarea);
    });
    textarea.addEventListener('keyup', Controller.keyUp);
    let send = cr('div', compose, 'class btn', 'Send');
    send.onclick = () => {
        Controller.sendMessage(textarea);
    }

}

function showLogin() {

    let wrapper = cr('div', app, 'class wrapper');

    let container = cr('div', wrapper, 'class container login');

    let header = cr('h1', container, 'class header', '<span>JS</span> Chat');
    
    let description = cr('div', container, 'class description', '<p>Velkommen til en live chat-tjeneste laget med JavaScript. Denne siden benytter seg av Firestore for å lagre og hente samtalelogger.</p><p>Vennligst fyll inn et brukernavn. Dette vil være din "tag" som andre kan se at meldingene kommer fra.</p>');
    
    let subHeader = cr('h2', container, '', 'Logg inn');
    
    let form = cr('div', container, 'class form');

    let username = cr('div', form, 'class input-field');
    let usernameLabel = cr('label', username, '', 'Visningsnavn: ');
    let usernameInput = cr('input', username, 'type text, class username');
    usernameInput.addEventListener('keydown', (e) => {
        Controller.loginKeyDown(e, usernameInput);
    });
    
    let submit = cr('div', form, 'class input-field');
    let submitBtn = cr('button', submit, 'type submit', 'Gå til chat');
    submitBtn.onclick = () => {
        Controller.login(usernameInput);
    }

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

export { show, cr }
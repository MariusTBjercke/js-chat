import { db } from './firestore';
import { doc, getDoc, setDoc, collection, getDocs, where, query, addDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { chat } from './model';
import { show, cr } from './view';
import * as timeago from 'timeago.js';
import nb_NO from 'timeago.js/lib/lang/nb_NO';

function auth() {

    let currentPage = chat.app.currentPage;
    let currentUser = chat.app.currentUser;
    let pages = chat.data.pages;

    if (pages.filter(x => x.name === currentPage && x.requiresAuth && !currentUser).length > 0) {
        console.log('Requires authentication..');
        show('login');
    }

}

async function updateUser(username, object) {

    const docRef = doc(db, "users", username);

    await setDoc(docRef, object);

}

function login(input) {

    let listeners = [];

    let success = validateInput(input, 'Glemt noe?', listeners);

    if (success) {

        let userObj = {
            password: '',
            online: true
        };

        chat.app.currentUser = input.value;
        updateUser(input.value, userObj);
        show('frontpage');
    }

}

function validateInput(input, errorMsg, listeners) {

    if (!input.value.trim() > 0) {
        input.classList.add('input-error');
        // Make sure listener is only added once
        if (!listeners.length > 0) {
            input.addEventListener('input', () => {
                validateInput(input, errorMsg, listeners);
            });
            listeners.push('Listening');
        }
        if (!input.parentNode.querySelector('.input-error-text')) {
            let errorText = cr('div', input.parentNode, 'class input-error-text', errorMsg);
        }
        input.value = '';
        return false;
    } else {
        input.classList.remove('input-error');
        let errorExists = input.parentNode.querySelector('.input-error-text');
        if (errorExists) {
            input.parentNode.querySelector('.input-error-text').remove();
        }
        return true;
    }

}

/**
 * 
 * @param {*} action read (returns a promise) or write
 * @param {*} document Which document to operate with
 * @param {*} object For "write" action. Object data to update document with.
 * @returns 
 */
async function firestore(action, document, object) {

    const docRef = document ? doc(db, "users", document) : false;

    switch (action) {
        case 'read':
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) return docSnap.data();
            else console.log('Read error..');
            break;
        case 'write':
            if (!object) return false;
            await setDoc(docRef, object);
            break;
        default:
            break;
    }

}

async function listChatParticipants(container) {

    const q = query(collection(db, "users"), where("online", "==", true));

    // Loading (spinner)
    let spinner = cr('div', container, 'class spinner');

    const querySnapshot = await getDocs(q);

    // Remove spinner
    spinner.remove();

    querySnapshot.forEach((doc) => {
        let participant = cr('div', container, 'class participant', doc.id);
    });

}

async function sendMessage(input) {

    let currentUser = chat.app.currentUser;

    let message = {
        author: currentUser,
        message: input.value,
        timestamp: Date.now()
    }

    // Reset textarea
    input.value = "";

    const docRef = await addDoc(collection(db, "messages"), message);

}

function keyDown(e, input) {

    if (e.key === 'Enter' || e.key === 'Shift') {

        if (chat.input.keysPressed.findIndex(x => x === e.key) === -1) {
            chat.input.keysPressed.push(e.key);
        }

        if (chat.input.keysPressed.findIndex(x => x === 'Shift') === -1) {
            e.preventDefault();
            sendMessage(input);
        }

    }

}

function keyUp(e) {

    if (e.key === 'Enter' || e.key === 'Shift') {
        chat.input.keysPressed.splice(chat.input.keysPressed.findIndex(x => x === e.key), 1);
    }

}

async function listMessages(container, window) {

    // Loading (spinner)
    let spinner = cr('div', window, 'class spinner');

    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {

        container.innerHTML = '';

        querySnapshot.forEach(doc => {

            let data = doc.data();

            let row = cr('div', container, 'class row');

            let authorRow = cr('div', row, 'class author');

            let date = new Date(data.timestamp);
            // Add Norwegian to timeago.js
            timeago.register('nb_NO', nb_NO);
            let dateString = timeago.format(date, 'nb_NO');
            let dateTxt = cr('div', authorRow, 'class date', dateString);

            let author = cr('span', authorRow, '', data.author + ':');

            let messageRow = cr('div', row, 'class message');
            let message = cr('div', messageRow, '', data.message);

        });

        spinner.remove();

        // Scroll chat window to bottom of chat
        window.scroll({
            top: window.scrollHeight,
        });

    });

}

export { auth, updateUser, login, listChatParticipants, sendMessage, keyDown, keyUp, listMessages }
import { db } from './firestore';
import { doc, getDoc, setDoc, collection, getDocs, where, query, addDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { chat } from './model';
import { show, cr } from './view';
import * as timeago from 'timeago.js';
import nb_NO from 'timeago.js/lib/lang/nb_NO';
import moment from 'moment';
let lastSeenInterval;

// DEV ONLY - START
// TODO: Delete this
if (chat.app.currentUser) {
    lastSeenInterval = setInterval(() => {
        setLastSeen(chat.app.currentUser);
    }, 5000);
}
// DEV ONLY - END

// A little bit "hacky", but it works (since I don't have access to background tasks)
setInterval(() => {
    checkUsers();
}, 5000);

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
            online: true,
            lastSeen: Date.now()
        };

        chat.app.currentUser = input.value;
        updateUser(input.value, userObj);
        // Update user last seen status every x ms
        lastSeenInterval = setInterval(() => {
            setLastSeen(chat.app.currentUser);
        }, 5000);
        show('frontpage');
    }

}

function logout() {

    setOnlineStatus(chat.app.currentUser, false);
    chat.app.currentUser = '';
    clearInterval(lastSeenInterval);
    show('login');

}

function loginKeyDown(e, input) {

    if (e.key === 'Enter') {
        login(input);
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

async function listChatParticipants(container) {

    const q = query(collection(db, "users"), where("online", "==", true));

    // Loading (spinner)
    let spinner = cr('div', container, 'class spinner');

    const unsubscribe = onSnapshot(q, (querySnapshot) => {

        container.innerHTML = '';

        querySnapshot.forEach(doc => {

            let participant = cr('div', container, 'class participant', doc.id);

        });

        // Remove spinner
        spinner.remove();

    });

}

async function sendMessage(input) {

    let currentUser = chat.app.currentUser;

    // Strip input value in case of HTML tags and so on
    let tmp = new DOMParser().parseFromString(input.value, 'text/html');
    let finalMsg = tmp.body.textContent || "";

    let message = {
        author: currentUser,
        message: finalMsg,
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

    const q = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(20));

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

            // Update timeago string every x ms
            setInterval(() => {
                let updatedDateString = timeago.format(date, 'nb_NO');
                dateTxt.innerHTML = updatedDateString;
            }, 1000);

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

async function setLastSeen(user) {

    await setDoc(doc(db, "users", user), {
        online: true,
        lastSeen: Date.now()
    });

}

async function checkUsers() {

    const querySnapshot = await getDocs(collection(db, "users"));

    querySnapshot.forEach((doc) => {

        let name = doc.id;
        let lastSeen = doc.data().lastSeen;
        let oldTime = moment().subtract(10, 'seconds');

        let check = moment(lastSeen).isAfter(moment(oldTime));

        if (!check) {
            setOnlineStatus(doc.id, false);
        }

    });

}

async function setOnlineStatus(user, bool) {

    await setDoc(doc(db, "users", user), {
        online: bool,
    });

}

export { auth, updateUser, login, loginKeyDown, listChatParticipants, sendMessage, keyDown, keyUp, listMessages, setLastSeen, checkUsers, logout }
import { db } from './firestore';
import { doc, setDoc } from 'firebase/firestore';
import { chat } from './model';
import { show, cr } from './view';

function auth() {
    let currentPage = chat.app.currentPage;
    let currentUser = chat.app.currentUser;
    let pages = chat.data.pages;

    if (pages.filter(x => x.name === currentPage && x.requiresAuth && !currentUser).length > 0) {
        console.log('Requires authentication..');
        show('login');
    }
}

async function updateUser(username) {
    const docRef = doc(db, "users", username);

    await setDoc(docRef, {
        messages: null,
    });
}

function login(input) {

    let listeners = [];

    let success = validateInput(input, 'Glemt noe?', listeners);

    if (success) {
        chat.app.currentUser = input.value;
        updateUser(input.value);
        show('frontpage');
    }

}

function validateInput(input, errorMsg, listeners) {
    if (!input.value.trim() > 0) {
        input.classList.add('input-error');
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

export { auth, updateUser, login }
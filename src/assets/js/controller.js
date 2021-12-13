import { db } from './firestore';
import { doc, setDoc } from 'firebase/firestore';
import { chat } from './model';
import { show } from './view';

function auth() {
    let currentPage = chat.app.currentPage;
    let currentUser = chat.app.currentUser;
    let pages = chat.data.pages;

    pages.filter(x => x.name === currentPage && x.requiresAuth && !currentUser).forEach(x => {
        console.log('Requires authentication..');
        show('login');
    });
}

async function updateUser(username) {
    const docRef = doc(db, "users", username);

    await setDoc(docRef, {
        username: username,
        test: 'Dette er en test',
    });
    console.log('Data: ', chat);
}

export { auth, updateUser }
import { db } from './firestore';
import { doc, setDoc } from 'firebase/firestore';

async function updateUser(username) {
    const docRef = doc(db, "users", username);

    await setDoc(docRef, {
        username: username,
        test: 'Dette er en test',
    });
}

export { updateUser }
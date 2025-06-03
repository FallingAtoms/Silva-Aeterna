// IMPORTANT: In a real application, you would get these from your Firebase project.
// For use within this Canvas environment, these mock credentials will allow Firestore to work.

const firebaseConfig = {
  apiKey: "AIzaSyCJkkjEayUX3pE8wC21g3Vwj7lWxhgOdhk",
  authDomain: "reddot-game.firebaseapp.com",
  projectId: "reddot-game",
  storageBucket: "reddot-game.firebasestorage.app",
  messagingSenderId: "976408909955",
  appId: "1:976408909955:web:babbab369301463d5fe3b6"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();
const dotElement = document.getElementById('dot');
const statusElement = document.getElementById('status');

// Firestore document reference
const gameDocRef = db.collection('game').doc('dotState');

// Function to update dot color locally
function updateDotColor(color) {
    dotElement.style.backgroundColor = color;
    statusElement.textContent = `The dot is now ${color}!`;
}

// Listen for clicks on the dot
dotElement.addEventListener('click', () => {
    // Determine the new color
    const currentColor = dotElement.style.backgroundColor || 'red'; // Default to red if not set
    const newColor = currentColor === 'red' ? 'blue' : 'red';

    // Update Firestore
    gameDocRef.set({ color: newColor })
        .then(() => {
            console.log('Color updated in Firestore:', newColor);
        })
        .catch((error) => {
            console.error('Error updating Firestore:', error);
            statusElement.textContent = 'Error syncing. Please try again.';
        });
});

// Listen for real-time updates from Firestore
gameDocRef.onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        if (data.color) {
            updateDotColor(data.color);
            console.log('Received update from Firestore:', data.color);
        }
    } else {
        // Document doesn't exist, let's initialize it
        console.log('No dot state found. Initializing to red.');
        gameDocRef.set({ color: 'red' })
            .then(() => updateDotColor('red'))
            .catch(err => console.error("Error initializing doc:", err));
    }
}, (error) => {
    console.error("Error listening to Firestore:", error);
    statusElement.textContent = 'Error connecting to real-time updates.';
});

// Initial fetch (though onSnapshot also handles this)
gameDocRef.get().then((doc) => {
    if (doc.exists) {
        const data = doc.data();
        if (data.color) {
            updateDotColor(data.color);
        } else {
            // If 'color' field is missing, initialize
            updateDotColor('red');
            gameDocRef.set({ color: 'red' });
        }
    } else {
        // If the document doesn't exist at all, initialize
        updateDotColor('red');
        gameDocRef.set({ color: 'red' });
    }
}).catch((error) => {
    console.error("Error getting initial document:", error);
    statusElement.textContent = 'Failed to load initial game state.';
    // Initialize to red locally if Firestore fails on first load
    updateDotColor('red');
});
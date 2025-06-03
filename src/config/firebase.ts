import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  authDomain: "hopehand-app.firebaseapp.com",
  projectId: "hopehand-app",
  storageBucket: "hopehand-app.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
export default app 
const hasValidConfig =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID

if (!hasValidConfig) {
  console.warn(
    `⚠️ Firebase credentials not configured. Please add these environment variables in the Vars section: ` +
      `NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, ` +
      `NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, ` +
      `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID`,
  )
}

let app: any = null
let auth: any = null
let db: any = null
let storage: any = null
let initialized = false

export async function initializeFirebase() {
  if (initialized || !hasValidConfig) {
    return { app, auth, db, storage }
  }

  try {
    const { initializeApp } = await import("firebase/app")
    const { getAuth } = await import("firebase/auth")
    const { getFirestore } = await import("firebase/firestore")
    const { getStorage } = await import("firebase/storage")

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)

    // The Firestore instance is now properly initialized above

    initialized = true
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }

  return { app, auth, db, storage }
}

export { hasValidConfig }
export { app, auth, db, storage }

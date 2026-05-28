// lib/google-auth.ts
import { auth } from './firebase';
import { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

// Add additional scopes if needed (optional)
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Sign in with Google popup
const getErrorMessage = (error: unknown) => {
  if (error instanceof FirebaseError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Firebase authentication failed.';
};

const getErrorCode = (error: unknown) =>
  error instanceof FirebaseError ? error.code : '';

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Get the Google Access Token (if needed for Google APIs)
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    console.log('User signed in:', {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        accessToken,
        idToken: await user.getIdToken(),
      },
    };
  } catch (error: unknown) {
    const errorCode = getErrorCode(error);
    const errorMessage = getErrorMessage(error);

    console.error('Google sign in error:', errorMessage);

    // Handle specific errors
    if (errorCode === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: 'Popup closed before completing sign in',
      };
    }
    if (errorCode === 'auth/popup-blocked') {
      return { success: false, error: 'Popup was blocked by browser' };
    }
    if (errorCode === 'auth/unauthorized-domain') {
      return {
        success: false,
        error:
          'Domain not authorized. Add it in Firebase Console → Authentication → Sign-in methods → Authorized domains',
      };
    }

    return { success: false, error: errorMessage };
  }
}

// Sign out
export async function logout() {
  try {
    await signOut(auth);
    console.log('User signed out');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);

    console.error('Sign out error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

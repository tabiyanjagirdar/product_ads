"use client"
import { auth } from '@/configs/firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

function Authentication({ children }: any) {
    const provider = new GoogleAuthProvider();
    const router = useRouter();

    const onButtonPress = () => {
        if (!auth) {
            // eslint-disable-next-line no-console
            console.warn('Firebase auth is not initialized. Set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local');
            return;
        }

        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential: any = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log(user);
                // Redirect to /app after successful sign-in
                router.push('/app');
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    }
    useEffect(() => {
        // Helpful runtime check: shows whether auth was initialized in the browser.
        // If this logs `null` the client bundle didn't pick up your NEXT_PUBLIC_ env vars
        // (or you started dev before creating .env.local). In that case, create .env.local
        // and restart the dev server.
        // eslint-disable-next-line no-console
        console.log('auth (runtime check):', auth);
    }, []);
    return (
        <div>
            <div onClick={onButtonPress}>
                {children}
            </div>
        </div>
    )
}

export default Authentication
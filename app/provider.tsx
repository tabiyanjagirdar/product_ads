"use client"
import { auth, db } from '@/configs/firebaseConfig';
import { AuthContext } from '@/context/AuthContext';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
interface AuthContextType {
    user: User | null;
}

function Provider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // If firebase auth couldn't be initialized (missing NEXT_PUBLIC_ env vars),
        // `auth` will be `null` — avoid calling onAuthStateChanged in that case.
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                // eslint-disable-next-line no-console
                console.log('User signed in:', user);

                // Save to Firestore if not exists and db is initialized
                if (db) {
                    try {
                        const userRef = doc(db, "users", user.uid);
                        const userSnap = await getDoc(userRef);

                        if (!userSnap.exists()) {
                            const userData = {
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName,
                                photoURL: user.photoURL,
                                createdAt: serverTimestamp(),
                                credits:20
                            };
                            // eslint-disable-next-line no-console
                            console.log('Saving user to Firestore:', userData);
                            await setDoc(userRef, userData);
                            // eslint-disable-next-line no-console
                            console.log('User saved successfully to Firestore');
                        } else {
                            // eslint-disable-next-line no-console
                            console.log('User already exists in Firestore');
                        }
                    } catch (error) {
                        // Log Firestore errors but don't break auth flow
                        // Common errors: offline, permission-denied, network-error
                        // eslint-disable-next-line no-console
                        console.error('Failed to save user to Firestore:', error);
                    }
                } else {
                    // eslint-disable-next-line no-console
                    console.warn('Firestore (db) is not initialized');
                }
            } else {
                setUser(null);
                // eslint-disable-next-line no-console
                console.log('User signed out');
            }
        });

        return () => {
            // unsubscribe may be undefined if we didn't call onAuthStateChanged
            try {
                if (typeof unsubscribe === 'function') unsubscribe();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    return (
        <NextThemesProvider {...props}>
            <AuthContext.Provider value={{ user }}>
                <div>
                    {children}
                </div>
            </AuthContext.Provider>
        </NextThemesProvider>
    )
}

// Custom hook to use auth
export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export default Provider


"use client"
import { auth } from '@/configs/firebaseConfig';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import React, { useEffect } from 'react'
import { useAuthContext } from '../provider';
import AnimatedCartoonAvatar from './AnimatedCartoonAvatar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function ProfileAvatar() {

    const user = useAuthContext();
    const router = useRouter();
    const onButtonPress = () => {
        if (!auth) {
            // eslint-disable-next-line no-console
            console.warn('Firebase auth is not initialized. Unable to sign out.');
            return;
        }

        signOut(auth).then(() => {
            // Sign-out successful.
            router.replace('/')
        }).catch((error) => {
            // An error happened.
        });
    }
    return (
        <div>
            <Popover >
                <PopoverTrigger>
                    <AnimatedCartoonAvatar
                        photoURL={user?.user?.photoURL || undefined}
                        displayName={user?.user?.displayName || 'User'}
                        className='w-[40px] h-[40px]'
                    />
                </PopoverTrigger>
                <PopoverContent className='w-full mx-w-lg cursor-pointer'>
                    <div className='space-y-2'>
                        <h3 className='font-semibold'>{user?.user?.displayName}</h3>
                        <p className='text-sm text-gray-600'>{user?.user?.email}</p>
                        <button 
                            onClick={onButtonPress}
                            className='w-full mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition'
                        >
                            Logout
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default ProfileAvatar
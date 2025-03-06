"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";

export default function YourProfile() {
    const { user } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState({
        username: '',
        about: '',
        profilepic: '',
        firstname: '',
        lastname: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            setUserData({
                username: user.username || '',
                about: user.about || '',
                profilepic: user.profilepic || '',
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                email: user.email || ''
            });
        } else {
            router.push('/login');
        }
    }, [user]);

    const handleUserData = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setUserData({ ...userData, [name]: value });
    }

    const submitUpdatedProfile = async (e) => {
        e.preventDefault();
        const { username, about, profilepic, firstname, lastname, email } = userData;
        if (!username || !about || !profilepic || !firstname || !lastname || !email) {
            alert("Please fill in all fields.");
            return;
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BACKEND}/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tkn')}`
                },
                body: JSON.stringify({
                    username,
                    about,
                    profilepic,
                    firstname,
                    lastname,
                    email,
                    id: user.id
                })
            });

            if (res.status === 200) {
                const data = await res.json();
                console.log("Profile updated successfully:", data);
            }
        } catch (err) {
            console.error("Error occurred while updating profile:", err);
        }
    }

    if (!user) {
        return <div>Loading...</div>; 
    }

    return (
        <form className="bg-black flex items-center justify-center">
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12 dark:border-gray-700">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-gray-100 text-center ">Your Profile</h2>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                                Username
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white dark:bg-gray-700 pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                                    <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6 dark:text-gray-400">streamsphere.com/</div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Enter your username."
                                        className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:bg-gray-800 dark:placeholder-gray-500"
                                        autoComplete='off'
                                        value={userData.username}
                                        onChange={handleUserData}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="about" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                                About
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="about"
                                    name="about"
                                    rows={3}
                                    className="block w-full rounded-md bg-white dark:bg-gray-700 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:text-gray-200 dark:placeholder-gray-500"
                                    placeholder='Write a few sentences about yourself.'
                                    onChange={handleUserData}
                                    value={userData.about}
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="photo" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                                Profile Picture
                            </label>
                            <div className="mt-2">
                                <input
                                    name="profilepic"
                                    type="text"
                                    autoComplete="off"
                                    placeholder='Enter your url here.'
                                    className="block w-full rounded-md bg-white dark:bg-gray-700 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:text-gray-200 dark:placeholder-gray-500"
                                    onChange={handleUserData}
                                    value={userData.profilepic}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-900/10 pb-12 dark:border-gray-700">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-gray-100">Personal Information</h2>
                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Use a permanent address where you can receive mail.</p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                                First name
                            </label>
                            <div className="mt-2">
                                <input
                                    name="firstname"
                                    type="text"
                                    autoComplete="off"
                                    className="block w-full rounded-md bg-white dark:bg-gray-700 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:text-gray-200 dark:placeholder-gray-500"
                                    placeholder='Firstname'
                                    onChange={handleUserData}
                                    value={userData.firstname}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                                Last name
                            </label>
                            <div className="mt-2">
                                <input
                                    name="lastname"
                                    type="text"
                                    autoComplete="off"
                                    className="block w-full rounded-md bg-white dark:bg-gray-700 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:text-gray-200 dark:placeholder-gray-500"
                                    placeholder='Lastname'
                                    onChange={handleUserData}
                                    value={userData.lastname}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    name="email"
                                    type="text"
                                    autoComplete="off"
                                    className="block w-full rounded-md bg-white dark:bg-gray-700 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:text-gray-200 dark:placeholder-gray-500"
                                    onChange={handleUserData}
                                    value={userData.email}
                                    disabled
                                ></input>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex justify-end gap-x-6">
                        <button
                            type="button"
                            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                            onClick={() => { setUserData({ username: "", about: "", profilepic: "", firstname: "", lastname: "", email: "" }) }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"  // Use "submit" type here
                            className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-700 focus:outline-none hover:bg-indigo-700 dark:ring-indigo-500 dark:hover:bg-indigo-600"
                            onClick={submitUpdatedProfile}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}



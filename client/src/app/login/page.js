"use client"
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from '@/context/AuthContext';

const LoginForm = () => {
    const { login } = useAuth();
    const [loginData, setLoginData] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setLoginData({ ...loginData, [name]: value });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = loginData;

        if (!email || !password) {
            alert("Please fill all the login credentials.");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BACKEND}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",  
                },
                body: JSON.stringify(loginData),  
            });

            if (res.ok) {
                const data = await res.json();
                login(data.tkn, data.user);
            } else {
                console.log("Login failed:", res.statusText);
            }
        } catch (err) {
            console.log("Error during login:", err);
        }
    };

    return (
        <div className="bg-black flex items-center justify-center text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-black rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center">Login</h2>
                <form className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={handleChange}
                            className="w-full mt-2 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleChange}
                            className="w-full mt-2 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={handleSubmit}
                    >
                        Log In
                    </button>
                </form>

                <p className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;

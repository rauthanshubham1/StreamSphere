"use client"
import React, { useState } from 'react';
import logo2 from "../../public/logo2.png";
import { Earth, Clapperboard, Podcast, ListVideo, UserPen, Menu, X, Bell } from 'lucide-react';
import { Menu as HeadlessMenu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('Dashboard');

    const NavItem = ({ icon: Icon, text, badge, link }) => (
        <Link href={link} className='flex basis-full  justify-evenly justify-items-start items-center'>
            <button
                onClick={() => setActiveItem(text)}
                className={`w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out
        ${activeItem === text
                        ? 'bg-black text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
        ${!isOpen && 'justify-center'}`}
            >

                <Icon size={24} className={activeItem === text ? 'text-white' : 'text-gray-400'} />
                {isOpen && <span>{text}</span>}
                {isOpen && badge && (
                    <span className="ml-auto rounded-full bg-black text-xs text-white px-2 py-0.5">{badge}</span>
                )}
            </button>
        </Link>
    );

    return (
        <>
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-lg text-white">
                <div className="mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">

                        {/* Left section: Logo and Menu Button */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
                                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            {/* Logo */}
                            <Link href="/" className="flex items-center">
                                <img
                                    src={logo2.src}
                                    alt="Logo"
                                    className="h-8 w-auto cursor-pointer"
                                />
                                <h1 className="text-2xl font-semibold text-white cursor-pointer" >
                                    StreamSphere
                                </h1>
                            </Link>

                        </div>

                        {
                            !user
                                ?
                                <div>

                                    <Link href="/login">
                                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300">
                                            Login
                                        </button>
                                    </Link>

                                    <Link href={"/signup"}>
                                        <button className="ml-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300">
                                            Signup
                                        </button>
                                    </Link>
                                </div>
                                :
                                <div className="flex items-center space-x-4 mr-4">
                                    {/* <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white">
                                        <Bell size={20} />
                                    </button> */}


                                    <HeadlessMenu as="div" className="relative ml-3 z-50">
                                        <div>
                                            <MenuButton className="relative flex rounded-full bg-black text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                                                <span className="absolute -inset-1.5" />
                                                <span className="sr-only">Open user menu</span>
                                                <img
                                                    alt="User Avatar"
                                                    src={user.profilepic}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            </MenuButton>
                                        </div>
                                        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-black py-1 ring-1 shadow-lg ring-white/10 transition focus:outline-hidden">
                                            <h2 className="block text-center px-4 py-2 text-sm text-white cursor-pointer">{user.email}</h2>
                                            <MenuItem>
                                                <Link
                                                    href="#"
                                                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                                                    onClick={logout}
                                                >
                                                    Logout
                                                </Link>
                                            </MenuItem>
                                        </MenuItems>
                                    </HeadlessMenu>
                                </div>
                        }

                    </div>
                </div>
            </nav >

            {/* Sidebar */}
            <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-black p-4 shadow-xl transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'} z-10`}>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-1">
                    <NavItem icon={Earth} text="Explore" link="/" />  {/* use badge="5"  for showing label */}
                    <NavItem icon={UserPen} text="Your Profile" link="/profile" />
                    <NavItem icon={Clapperboard} text="Upload Video" link="/upload-video" />
                    <NavItem icon={ListVideo} text="Your Videos" link="/your-videos" />
                </nav>


            </div>
            {/* </div> */}
        </>
    );
};

export default Navbar;

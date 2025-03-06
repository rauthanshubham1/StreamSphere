"use client";
import React, { useEffect, useState } from "react";
import VideoPlayer from 'next-video/player';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";

const WatchVideo = ({ searchParams }) => {
    const { user } = useAuth();
    const videoId = searchParams.vid;
    const [videoDetails, setVideoDetails] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);

    const router = useRouter();

    useEffect(() => {
        const getVideoDetails = async () => {
            try {
                const tkn = localStorage.getItem('tkn');
                if (!tkn) {
                    router.push("/login");
                }
                const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BACKEND}/get-video?videoId=${videoId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tkn}`
                    },
                });
                const data = await res.json();
                if (res.ok) {
                    setVideoDetails(data);
                    setLikes(data.likes);
                    setIsLiked(data.isLiked);
                } else {
                    router.push("/login");
                    throw new Error("Cannot fetch the video");
                }
            } catch (error) {
                console.error(error);
            }
        };
        getVideoDetails();
    }, []);

    const handleLike = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BACKEND}/toggle-like-video`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ videoId, isLiked, userId: user.id })
            });
            if (res.ok) {
                setLikes(isLiked ? likes - 1 : likes + 1);
                setIsLiked(!isLiked);

            } else {
                console.error("Error liking video");
            }
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className="min-h-screen bg-black text-white">
            {/* Video Player Section */}
            <div className="flex flex-col lg:flex-row px-6 py-4">

                {/* Main Video Player */}
                <div className="lg:w-2/3 w-full p-4">
                    <div className="w-full aspect-video bg-gray-900 rounded-lg shadow-lg">
                        {
                            videoDetails
                                ?
                                (
                                    <VideoPlayer src={videoDetails.video_url} />
                                )
                                :
                                (
                                    <p className="text-center text-gray-400">Loading video...</p>
                                )
                        }
                    </div>
                    {videoDetails && (
                        <>
                            <h1 className="text-2xl font-semibold mt-4">{videoDetails.title}</h1>
                            <p className="text-gray-400 mt-2">{videoDetails.description}</p>
                        </>
                    )}

                    {/* Like and Comment Section */}
                    <div className="mt-4 flex items-center gap-4">
                        <button onClick={handleLike} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                            {isLiked ? "Unlike" : "Like"} {likes}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default WatchVideo;

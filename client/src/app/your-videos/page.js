"use client"
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

export default function VideoPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [videos, setVideos] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            const token = localStorage.getItem("tkn");
            if (!token) {
                console.log("No token found");
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BACKEND}/get-user-all-videos`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch videos");
                }

                const data = await res.json();
                setVideos(data.videos);
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!user) {
            router.push("/login");
            return;
        }
        fetchVideos();
    }, []);


    return (
        <div>
            {/* ✅ Heading Always Visible */}
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-gray-100 text-center">
                Your Videos
            </h2>

            <VideoList videos={videos} loading={loading} />
        </div>
    );
}

const VideoList = ({ videos, loading }) => {
    if (loading) {
        return <VideoSkeleton />;
    }

    if (!videos || videos.length === 0) {
        return <p className="text-center text-gray-500">No videos found.</p>;
    }

    return (
        <div className="space-y-4">
            {videos.map((video) => (
                <div key={video.id} className="flex items-center bg-gray-900 p-4 rounded-lg hover:bg-gray-700 cursor-pointer">
                    <Link href={`/watch?vid=${video.id}`} className="flex-grow flex items-center">
                        <div className="relative w-24 h-16 mr-4">
                            <img
                                src="https://dafontfinder.com/wp-content/uploads/Thumbnail-Font.webp"
                                alt="Thumbnail"
                                className="object-cover w-full h-full rounded-md"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-white text-sm font-medium">{video.title}</h3>
                            <div className="flex items-center text-gray-400 text-xs">
                            </div>
                        </div>
                    </Link>

                </div>
            ))}
        </div>
    );
};

const VideoSkeleton = () => {
    return (
        <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center bg-gray-800 p-4 rounded-lg animate-pulse">
                    <div className="w-24 h-16 bg-gray-700 rounded-md mr-4"></div>
                    <div className="flex-grow">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};





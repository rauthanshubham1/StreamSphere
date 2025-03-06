"use client"
import { useEffect, useState } from 'react'
import React from 'react'
import Card from './Card'

const VideoGallery = () => {
    const [allVideos, setAllVideos] = useState(null);

    useEffect(() => {
        const getAllVideosForFeed = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BACKEND}/get-all-videos-for-feed`, {
                    method: "GET"
                })
                const data = await res.json();

                if (res.ok) {
                    setAllVideos(data.videos);
                } else {
                    throw new Error(data.message || "Failed to fetch videos");
                }
            } catch (error) {
                throw new Error("Cannot fetch all the videos");
            }
        }
        getAllVideosForFeed();
    }, [])



    return (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {allVideos && allVideos.map((video) => (
                <Card
                    key={video.id}
                    vId={video.id}
                    title={video.title}
                    tags={video.tags}
                    video_url={video.video_url}
                />
            ))}
        </div>

    )
}

export default VideoGallery
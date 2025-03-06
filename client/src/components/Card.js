import React from 'react'
import Link from 'next/link'

const Card = ({ title, tags, vId }) => {
    return (
        <div className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer group w-[250px]">
            <Link href={`/watch?vid=${vId}`}>
                <div className="space-y-4">
                    <p className="text-[13px] font-semibold">{title}</p>
                    <p className="text-[13px] text-gray-400">{tags}</p>
                    <div className="relative">
                        <img
                            src="https://dafontfinder.com/wp-content/uploads/Thumbnail-Font.webp"
                            alt="Frontend Radio"
                            className="w-full rounded shadow-lg object-cover"
                        />
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default Card
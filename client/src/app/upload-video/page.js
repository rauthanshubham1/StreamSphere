"use client"
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';

export default function VideoUpload() {
  const { user } = useAuth();
  const router = useRouter();
  const [video, setVideo] = useState(null);

  const [videoUploadData, setVideoUploadData] = useState({
    title: '',
    tags: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setVideo(files[0]);
    } else {
      setVideoUploadData({ ...videoUploadData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video) {
      alert('Please select a video to upload.');
      return;
    }

    setIsLoading(true);

    let upload_url = "";
    // GET UPLOAD URL
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_UPLOAD_VIDEO_SERVICE_BACKEND}/upload-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tkn')}`
        },
        body: JSON.stringify({
          title: videoUploadData.title,
          description: videoUploadData.description,
          tags: videoUploadData.tags
        })
      });

      if (response.ok) {
        const data = await response.json();
        upload_url = data.upload_url;
      } else {
        console.error('Error uploading video:', response.statusText);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsLoading(false);
      return;
    }

    // PUT THE VIDEO IN S3
    try {
      const response = await fetch(upload_url, {
        method: 'PUT',
        body: video,
        headers: {
          'Content-Type': video.type,
        }
      });
      if (response.ok) {
        console.log('Upload success');
      } else {
        console.error('Error uploading video:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black shadow-lg text-white p-6 space-y-10">
      <h2 className="text-base/7 font-semibold text-gray-900 dark:text-gray-100 text-center">Upload Your Video</h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* File Upload */}
        <div className="border-4 border-dashed rounded-lg p-8 bg-gray-700 border-gray-600">
          <div className="flex flex-col items-center justify-center">
            {!video ? (
              <div className="text-center text-gray-400">
                <p className="text-lg font-semibold">Click to upload your video</p>
                <input
                  type="file"
                  accept="video/*"
                  name="video"
                  onChange={handleChange}
                  className="hidden"
                />
                <button
                  type="button"
                  className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
                  onClick={() => document.querySelector('input[type="file"]').click()}
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-lg font-semibold">Selected Video: {video.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={videoUploadData.title}
            onChange={handleChange}
            placeholder="Enter a title for the video"
            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white placeholder-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={videoUploadData.description}
            onChange={handleChange}
            placeholder="Enter a description for the video"
            rows="4"
            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white placeholder-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium">Tags</label>
          <input
            type="text"
            name="tags"
            value={videoUploadData.tags}
            onChange={handleChange}
            placeholder="Add tags (comma separated)"
            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white placeholder-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-semibold text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-t-2 border-t-indigo-600 border-indigo-400 rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload Video'
            )}
          </button>
        </div>
      </form>

    </div>
  );
}

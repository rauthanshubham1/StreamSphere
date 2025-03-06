import express from "express";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"
import dotenv from "dotenv";
dotenv.config();

const uploadserviceRouter = express.Router();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    }
});

const putObject = async (filename, contentType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        ContentType: contentType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 })      // { expiresIn: 60 }
    return url;
}

uploadserviceRouter.post("/upload-video", async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }
        const uniqueId = uuidv4();
        const upload_url = await putObject(`${uniqueId}.mp4`, 'video/mp4');
        const newTags = req.body.tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        const response = await fetch(`http://localhost:8002/api/add-video-details-in-db`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title: req.body.title,
                description: req.body.description,
                tags: newTags,
                video_url: `https://d2mo41mehds4ka.cloudfront.net/${uniqueId}.mp4/playlist.m3u8`
            }),
        });

        res.status(200).json({
            message: "Upload video via URL",
            upload_url,
        });
    } catch (error) {
        console.error("Error generating upload URL:", error);
        res.status(500).json({
            message: "Failed to generate upload URL",
            error: error.message,
        });
    }
});


export default uploadserviceRouter;

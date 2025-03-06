import express from "express";
import jwt from "jsonwebtoken"
import verifyToken from "../middleware/verifyToken.js";
import prisma from "../db/db.config.js";
import Redis from "ioredis";

const userserviceRouter = express.Router();
const redis = new Redis();

userserviceRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },  
            process.env.JWT_SECRET_KEY,          

        );

        const responseUser = {
            id: user.id,
            email: user.email,
            profilepic: user.profilepic,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            about: user.about
        };

        res.status(200).json({ message: "Login successful", user: responseUser, tkn: token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

userserviceRouter.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
        const findUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (findUser) {
            return res.status(400).json({ message: "Email already taken, try another email" });
        }

        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: password
            }
        })

        res.status(200).json({ message: "Signup successful" });
    } else {
        res.status(400).json({ message: "Missing email or password" });
    }
});

userserviceRouter.put('/update-profile', async (req, res) => {
    const { username, about, profilepic, firstname, lastname, email, id } = req.body;

    if (!username || !about || !profilepic || !firstname || !lastname || !email) {
        return res.status(400).json({ message: 'Please provide all fields.' });
    }

    await prisma.user.update({
        where: {
            email,
            id
        },
        data: {
            username, firstname, lastname, about, profilepic
        }
    })

    res.status(200).json({ message: 'Profile updated successfully' });
});

userserviceRouter.get('/get-user', verifyToken, async (req, res) => {
    try {
        const { id, email } = req;
        const user = await prisma.user.findUnique({
            where: { id, email }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const responseUser = {
            id: user.id,
            email: user.email,
            profilepic: user.profilepic,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            about: user.about
        };

        res.status(200).json({ user: responseUser });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

userserviceRouter.get('/get-user-all-videos', verifyToken, async (req, res) => {
    try {
        const { id } = req;
        const videos = await prisma.video.findMany({
            where: { userId: id }
        });
        console
        res.status(200).json({ "message": "Video fetching successful", videos });
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

userserviceRouter.post("/add-video-details-in-db", verifyToken, async (req, res) => {
    try {
        const { video_url, title, description, tags } = req.body;
        const video = await prisma.video.create({
            data: {
                userId: req.id,
                title,
                description,
                tags,
                video_url
            }
        });
        redis.set(`videos:likes:${video.id}`, 0);
        res.status(201).json({
            message: "Video details saved successfully",
            video
        });
    } catch (err) {
        console.error("Error saving video details:", err);
        res.status(500).json({
            message: "Failed to save video details",
            error: err.message
        });
    }
})

userserviceRouter.get("/get-video", verifyToken, async (req, res) => {
    try {
        const { videoId } = req.query;
        const userId = req.id; 

        if (!videoId) {
            return res.status(400).json({ message: "Video ID is required" });
        }

        const video = await prisma.video.findUnique({
            where: { id: Number(videoId) },
        });

        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        let likes = await redis.get(`videos:likes:${videoId}`);
        likes = likes ? parseInt(likes, 10) : 0;

        const isLiked = await redis.sismember(`videos:likedBy:${videoId}`, userId);

        res.status(200).json({ ...video, likes, isLiked: !!isLiked }); 
    } catch (err) {
        console.error("Error fetching video details:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

userserviceRouter.get("/get-all-videos-for-feed", async (req, res) => {
    try {
        const videos = await prisma.video.findMany();
        res.status(200).send({ videos });
    } catch (err) {
        console.log(err)
    }
})

userserviceRouter.post("/toggle-like-video", async (req, res) => {
    try {
        const { isLiked, videoId, userId } = req.body;
        if (!videoId || !userId) {
            return res.status(400).json({ message: "Video ID and User ID are required" });
        }

        const likeKey = `videos:likes:${videoId}`;
        const userLikeKey = `videos:likedBy:${videoId}`;

        if (!isLiked) {
            const alreadyLiked = await redis.sismember(userLikeKey, userId);
            if (!alreadyLiked) {
                await redis.incr(likeKey);
                await redis.sadd(userLikeKey, userId);
            }
        } else {
            const alreadyLiked = await redis.sismember(userLikeKey, userId);
            if (alreadyLiked) {
                await redis.decr(likeKey);
                await redis.srem(userLikeKey, userId);
            }
        }

        const likesCount = await redis.get(likeKey) || 0;
        res.status(200).json({ message: "Success", likes: parseInt(likesCount, 10) });
    } catch (err) {
        console.error("Error in toggling like:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

export default userserviceRouter;


import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";

// CORS Middleware
app.use(cors());

import userserviceRouter from "./routes/routes.js";

const PORT = process.env.PORT || 8002;
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", userserviceRouter);

app.listen(PORT, () => {
    console.log(`User Server running at http://localhost:${PORT}`);
});

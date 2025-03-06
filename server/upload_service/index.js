import express from "express";
const app = express();
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
app.use(cors());

import uploadserviceRouter from "./routes/routes.js";

const PORT = process.env.PORT || 8001;

app.use(express.json());

app.use("/api", uploadserviceRouter);

app.listen(PORT, () => {
    console.log(`Upload Server running at http://localhost:${PORT}`);
});
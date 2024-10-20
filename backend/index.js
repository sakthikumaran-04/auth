import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { connectToDB } from "./utils/connectToDB.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes);

app.listen(port, async () => {
  await connectToDB();
  console.log(`Server is listening on http://localhost:${port}`);
});

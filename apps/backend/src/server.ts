import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PreInterviewBody } from "../types";
import axios from "axios";

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" },
  }),
);

app.use(express.json());

const GITHUB_URL_RE =
  /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\/?$/;

app.post("/api/v1/pre-interview", async (req, res) => {
  const { data, success } = PreInterviewBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect body",
    });
  }

  if (!GITHUB_URL_RE.test(data.github)) {
    return res.status(400).json({
      message: "Invalid GitHub profile URL",
    });
  }

  const githubUrl = data.github.endsWith("/")
    ? data.github.slice(0, -1)
    : data.github;
  const githubUsername = githubUrl.split("/").pop();

  try {
    const userRepos = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos`,
    );

    const filteredUserRepos = userRepos.data.map((x: any) => ({
      description: x.description,
      name: x.name,
      fullName: x.full_name,
      starCount: x.star_count,
    }));

    return res.json({ repos: filteredUserRepos });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return res.status(404).json({ message: "GitHub user not found" });
    }
    return res.status(502).json({ message: "Failed to fetch GitHub data" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

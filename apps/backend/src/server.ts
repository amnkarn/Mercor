import express from "express";
import { PreInterviewBody } from "../types";
import axios from "axios";


const app = express();
app.use(express.json());

app.post("/api/v1/pre-interview", async (req, res) => {
    const { data, success } = PreInterviewBody.safeParse(req.body);
    if(!success) {
        return res.status(411).json({
            message: "Incorrect body"
        })
    }

    const githubUrl = data.github.endsWith("/") ? data.github.slice(0, -1) : data.github;

    const githubUsername = githubUrl.split("/").pop();

    const userRepos = await axios.get(`https://api.github.com/users/${githubUsername}/repos`);
    const filteredUserRepos = userRepos.data.map((x: any) => ({
        description: x.description,
        name: x.name,
        fullName: x.full_name,
        starCount: x.star_count,
    }))

    console.log(filteredUserRepos);
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server is listning on port ${PORT}`);
})
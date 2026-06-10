import express from "express";

const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
    console.log("hello");
})

app.listen(port, () => {
    console.log(`server is litning on port ${port}`)
})
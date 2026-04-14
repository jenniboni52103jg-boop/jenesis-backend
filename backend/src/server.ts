import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("SERVER OK 🚀");
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
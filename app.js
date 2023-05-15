require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const rateLimit = require("express-rate-limit");

const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");

const app = express();
mongoose
  .connect(
    `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.DB_NAME}/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(express.json());
app.use(cors());

app.use("/api/auth", limiter, userRoutes);
app.use("/api/sauces", saucesRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

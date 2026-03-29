const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// STATIC
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES (INI SUDAH CUKUP)
const routes = require("./route");
app.use(routes);

app.get("/:username/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "news", "index.html"));
});

app.get("/news/:id", (req, res) => {
    const id = req.params.id;
    res.sendFile(path.join(__dirname, `news/${id}.html`));
});

// RESET PAGE
app.use("/reset", express.static(path.join(__dirname, "public/reset")));

// LOGGER
app.use((req, res, next) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const domain = req.get("host");

    console.log(`Request masuk dari: ${protocol}://${domain}${req.originalUrl}`);
    next();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
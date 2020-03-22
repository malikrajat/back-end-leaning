const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const mangoose = require("mongoose");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");
const app = express();
app.use(bodyParser.json());
app.use("upload/images", express.static(path.join("uploads", "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");
  next();
});
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);
app.use((req, res, next) => {
  throw new HttpError("could not find route", 404);
});
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});
mangoose
  .connect(
    // "mongodb+srv://test:k3WWEzVovPYpQg8g@cluster0-sck8n.mongodb.net/places?retryWrites=true&w=majority"
    "mongodb+srv://test:k3WWEzVovPYpQg8g@place-demo-vmmnt.mongodb.net/test?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(error => {
    console.log(error);
  });

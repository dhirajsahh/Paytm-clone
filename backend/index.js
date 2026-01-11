const express = require("express");
require("dotenv").config();
const { connectdb } = require("./connectdb");
const cors = require("cors");
const mainRouter = require("./routes/index");
const Port = process.env.Port;
const app = express();
app.use(cors);
app.use(express.json());
app.use("/api/v1", mainRouter);
connectdb()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(Port, () => {
      console.log(`App is listening in Port ${Port}`);
    });
  })
  .catch((e) => {
    console.log("Error connecting the database", e);
  });

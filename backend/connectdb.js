const mongoose = require("mongoose");
require("dotenv").config();

const connectdb = async () => {
  await mongoose.connect(process.env.Mongo_uri);
};
module.exports = { connectdb };

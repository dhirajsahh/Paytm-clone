const mongoose = require("mongoose");
require("dotenv").config();

const connectdb = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};
module.exports = { connectdb };

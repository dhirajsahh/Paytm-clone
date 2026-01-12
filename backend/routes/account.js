const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { Account } = require("../models/accountModel");

const router = express.Router();

router.post("/loadbalance", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const balance = Number(req.body.balance);
  if (!Number.isInteger(balance)) {
    return res.json({
      message: "You cannot load floating point money",
    });
  }
  try {
    const amount = new Account({
      userId,
      balance,
    });
    await amount.save();
    if (!amount) {
      return res.json({
        message: "Error occured while loading balance",
      });
    }
    return res.json({
      message: "Amount loaded successfully",
    });
  } catch (err) {
    console.log("Error occured while loading balance");
    res.json({
      message: "Error occured while loading balance",
    });
  }
});
router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { amount, to } = req.body;
    amount = Number(amount);

    const account = await Account.findOne({ userId: req.userId }).session(
      session
    );

    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    await Account.findByIdAndUpdate(req.userId, {
      $inc: { balance: -amount },
    }).session(session);
    await Account.findByIdAndUpdate(to, { $inc: { balance: amount } }).session(
      session
    );

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Transfer successful",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(" Transaction failed:", err);
  }
});
module.exports = router;

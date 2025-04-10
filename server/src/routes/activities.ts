// src/routes/activities.ts
import express from "express";
import dbConnect from "../lib/mongodb";
import Activity, { IActivityQuery } from "../models/Activity";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await dbConnect();
    const { wallet } = req.query;

    const query: IActivityQuery = {};
    if (wallet) {
      query.user = wallet as string;
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(activities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return res.status(500).json({ error: "Failed to fetch activities" });
  }
});

export default router;
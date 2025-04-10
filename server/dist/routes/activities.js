"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/activities.ts
const express_1 = __importDefault(require("express"));
const mongodb_1 = __importDefault(require("../lib/mongodb"));
const Activity_1 = __importDefault(require("../models/Activity"));
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        await (0, mongodb_1.default)();
        const { wallet } = req.query;
        const query = {};
        if (wallet) {
            query.user = wallet;
        }
        const activities = await Activity_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json(activities);
    }
    catch (error) {
        console.error("Failed to fetch activities:", error);
        return res.status(500).json({ error: "Failed to fetch activities" });
    }
});
exports.default = router;

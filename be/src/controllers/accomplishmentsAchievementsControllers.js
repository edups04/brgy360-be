import { AccomplishmentAchievement } from "../models/accomplishmentsAchievementsModel.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { nullChecker } from "../utils/nullChecker.js";
import { checkDuplicate } from "../utils/duplicateChecker.js";

const createAccomplishmentAchievement = async (req, res) => {
  try {
    const image = req.file?.filename || "N/A";

    const { title, date, contents, barangayId } = req.body;

    const hasMissingFields = nullChecker(res, {
      title,
      date,
      contents,
      barangayId,
    });
    console.log(hasMissingFields);
    if (hasMissingFields) return;

    let isDup = await checkDuplicate(res, AccomplishmentAchievement, {
      title: title,
      date: date,
    });
    if (isDup) return;

    isDup = await checkDuplicate(res, AccomplishmentAchievement, {
      title: req.body.title,
    });
    if (isDup) return;

    const accomplishmentAchievement = new AccomplishmentAchievement({
      ...req.body,
      image: image,
    });

    await accomplishmentAchievement.save();

    res.status(201).json({
      success: true,
      message: "Accomplishments and Achievements created successfully",
      data: accomplishmentAchievement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAccomplishmentAchievement = async (req, res) => {
  try {
    const accomplishmentAchievement = await AccomplishmentAchievement.findById(
      req.params.id
    );
    if (!accomplishmentAchievement)
      return res.status(404).json({
        success: false,
        message: "Accomplishments and Achievements not found",
      });
    res.json({
      success: true,
      message: "Accomplishments and Achievements retrieved",
      data: accomplishmentAchievement,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getAccomplishmentAchievements = async (req, res) => {
  try {
    const { page = 1, limit = 10, title, date, barangayId } = req.query;

    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // * partial, case-insensitive match
    }
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (barangayId) {
      filter.barangayId = barangayId;
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const accomplishmentAchievements = await AccomplishmentAchievement.find(
      filter
    )
      .sort({ date: -1 }) // * Sort by date DESCENDING (latest first)
      .skip(skip)
      .limit(limitNumber);

    const total = await AccomplishmentAchievement.countDocuments(filter);

    res.json({
      success: true,
      message: "Accomplishments and Achievements retrieved",
      data: accomplishmentAchievements,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateAccomplishmentAchievement = async (req, res) => {
  try {
    const accomplishmentAchievementId = req.params.id;
    const existingAccomplishmentAchievement =
      await AccomplishmentAchievement.findById(accomplishmentAchievementId);

    if (!existingAccomplishmentAchievement) {
      return res.status(404).json({
        success: false,
        message: "Accomplishments and Achievements not found",
      });
    }

    const { title, date, contents, barangayId } = req.body;

    const hasMissingFields = nullChecker(res, {
      title,
      date,
      contents,
      barangayId,
    });
    console.log(hasMissingFields);
    if (hasMissingFields) return;

    let isDup = await checkDuplicate(
      res,
      AccomplishmentAchievement,
      {
        title: title,
        date: date,
      },
      accomplishmentAchievementId
    );
    if (isDup) return;

    isDup = await checkDuplicate(
      res,
      AccomplishmentAchievement,
      {
        title: req.body.title,
      },
      accomplishmentAchievementId
    );
    if (isDup) return;

    const image = req.file?.filename || "N/A";
    const updates = { ...req.body };

    if (image && image !== "N/A") {
      // * delete old profile image
      if (
        existingAccomplishmentAchievement.image &&
        existingAccomplishmentAchievement.image !== "N/A"
      ) {
        const oldPath = path.join(
          "public/images",
          existingAccomplishmentAchievement.image
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = image;
    } else {
      const oldPath = path.join(
        "public/images",
        existingAccomplishmentAchievement.image
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      updates.image = "N/A";
    }

    const updatedAccomplishmentAchievement =
      await AccomplishmentAchievement.findByIdAndUpdate(
        accomplishmentAchievementId,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    res.json({
      success: true,
      message: "Accomplishments and Achievements updated successfully",
      data: updatedAccomplishmentAchievement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteAccomplishmentAchievement = async (req, res) => {
  try {
    const accomplishmentAchievement = await AccomplishmentAchievement.findById(
      req.params.id
    );

    if (!accomplishmentAchievement) {
      return res.status(404).json({
        success: false,
        message: "Accomplishments and Achievements not found",
      });
    }

    const deleteFile = (filename) => {
      if (filename && filename !== "N/A") {
        const filePath = path.join("public/images", filename);
        if (fs.existsSync(filePath)) {
          // * check if file exists
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filename}`);
        } else {
          console.log(`File not found: ${filename}`);
        }
      }
    };

    deleteFile(accomplishmentAchievement.image);

    await AccomplishmentAchievement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message:
        "Accomplishments and Achievements and associated image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  createAccomplishmentAchievement,
  getAccomplishmentAchievement,
  getAccomplishmentAchievements,
  updateAccomplishmentAchievement,
  deleteAccomplishmentAchievement,
};

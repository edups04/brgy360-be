import { NewsAnnouncement } from "../models/newsAnnouncementsModel.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { nullChecker } from "../utils/nullChecker.js";
import { checkDuplicate } from "../utils/duplicateChecker.js";

const createNewsAnnouncement = async (req, res) => {
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

    let isDup = await checkDuplicate(res, NewsAnnouncement, {
      title,
      date,
    });
    if (isDup) return;

    isDup = await checkDuplicate(res, NewsAnnouncement, {
      title,
    });
    if (isDup) return;

    const newsAnnouncement = new NewsAnnouncement({
      ...req.body,
      image: image,
    });

    await newsAnnouncement.save();

    res.status(201).json({
      success: true,
      message: "News Announcement created successfully",
      data: newsAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getNewsAnnouncement = async (req, res) => {
  try {
    const newsAnnouncement = await NewsAnnouncement.findById(req.params.id);
    if (!newsAnnouncement)
      return res
        .status(404)
        .json({ success: false, message: "News Announcement not found" });
    res.json({
      success: true,
      message: "News Announcement retrieved",
      data: newsAnnouncement,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getNewsAnnouncements = async (req, res) => {
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

    const announcements = await NewsAnnouncement.find(filter)
      .sort({ date: -1 }) // * Sort by date DESCENDING (latest first)
      .skip(skip)
      .limit(limitNumber);

    const total = await NewsAnnouncement.countDocuments(filter);

    res.json({
      success: true,
      message: "News Announcements retrieved",
      data: announcements,
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

const updateNewsAnnouncement = async (req, res) => {
  try {
    const newsAnnouncementId = req.params.id;
    const existingAnnouncement = await NewsAnnouncement.findById(
      newsAnnouncementId
    );

    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "News Announcement not found",
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
      NewsAnnouncement,
      {
        title: req.body.title,
        date: req.body.date,
      },
      newsAnnouncementId
    );
    if (isDup) return;

    isDup = await checkDuplicate(
      res,
      NewsAnnouncement,
      {
        title,
      },
      newsAnnouncementId
    );
    if (isDup) return;

    const image = req.file?.filename || "N/A";
    const updates = { ...req.body };

    if (image && image !== "N/A") {
      // * delete old profile image
      if (existingAnnouncement.image && existingAnnouncement.image !== "N/A") {
        const oldPath = path.join("public/images", existingAnnouncement.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = image;
    } else {
      const oldPath = path.join("public/images", existingAnnouncement.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      updates.image = "N/A";
    }

    const updatedAnnouncement = await NewsAnnouncement.findByIdAndUpdate(
      newsAnnouncementId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "News Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteNewsAnnouncement = async (req, res) => {
  try {
    const newsAnnouncement = await NewsAnnouncement.findById(req.params.id);

    if (!newsAnnouncement) {
      return res
        .status(404)
        .json({ success: false, message: "News Announcement not found" });
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

    deleteFile(newsAnnouncement.image);

    await NewsAnnouncement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "News Announcement and associated image deleted successfully",
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
  createNewsAnnouncement,
  getNewsAnnouncement,
  getNewsAnnouncements,
  updateNewsAnnouncement,
  deleteNewsAnnouncement,
};

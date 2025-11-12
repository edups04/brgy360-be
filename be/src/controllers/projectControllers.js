import { Project } from "../models/projectModel.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { nullChecker } from "../utils/nullChecker.js";
import { checkDuplicate } from "../utils/duplicateChecker.js";

const createProject = async (req, res) => {
  try {
    // * nulls
    const { title, date, contents, barangayId } = req.body;

    // * Check for missing required fields
    const hasMissingFields = nullChecker(res, {
      title,
      date,
      contents,
      barangayId,
    });

    if (hasMissingFields) return;

    // * duplicates
    let isDup = await checkDuplicate(res, Project, {
      title,
      date,
    });
    if (isDup) return;

    isDup = await checkDuplicate(res, Project, {
      title,
    });
    if (isDup) return;

    const image = req.file?.filename || "N/A";

    const project = new Project({
      ...req.body,
      image: image,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    res.json({
      success: true,
      message: "Project retrieved",
      data: project,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getProjects = async (req, res) => {
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

    const projects = await Project.find(filter)
      .sort({ date: -1 }) // * Sort by date DESCENDING (latest first)
      .skip(skip)
      .limit(limitNumber);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      message: "Projects retrieved",
      data: projects,
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

const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const { title, date, contents, barangayId } = req.body;

    // * Check for missing required fields
    const hasMissingFields = nullChecker(res, {
      title,
      date,
      contents,
      barangayId,
    });

    if (hasMissingFields) return;

    // * duplicates
    let isDup = await checkDuplicate(
      res,
      Project,
      {
        title: req.body.title,
        date: req.body.date,
      },
      projectId
    );
    console.log(isDup);
    if (isDup) return;

    isDup = await checkDuplicate(
      res,
      Project,
      {
        title,
      },
      projectId
    );
    if (isDup) return;

    const image = req.file?.filename || "N/A";
    const updates = { ...req.body };

    if (image && image !== "N/A") {
      // * delete old profile image
      if (existingProject.image && existingProject.image !== "N/A") {
        const oldPath = path.join("public/images", existingProject.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = image;
    } else {
      const oldPath = path.join("public/images", existingProject.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      updates.image = "N/A";
    }

    const updatedProject = await Project.findByIdAndUpdate(projectId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
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

    deleteFile(project.image);

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project and associated image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export { createProject, getProject, getProjects, updateProject, deleteProject };

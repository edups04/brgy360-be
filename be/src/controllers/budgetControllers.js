import { Budget } from "../models/budgetModel.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { nullChecker } from "../utils/nullChecker.js";
import { checkDuplicate } from "../utils/duplicateChecker.js";

const createBudget = async (req, res) => {
  try {
    const file = req.file?.filename || "N/A";

    const { title, date, barangayId } = req.body;

    const hasMissingFields = nullChecker(res, {
      title,
      date,
      barangayId,
    });
    console.log(hasMissingFields);
    if (hasMissingFields) return;

    let isDup = await checkDuplicate(res, Budget, {
      title,
      date,
    });
    if (isDup) return;

    isDup = await checkDuplicate(res, Budget, {
      title,
    });
    if (isDup) return;

    let budget = new Budget({
      ...req.body,
      file: file,
    });

    await budget.save();

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: budget,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget)
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    res.json({ success: true, message: "Budget retrieved", data: budget });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// const getBudgets = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, title, date, barangayId } = req.query;

//     const filter = {};
//     if (title) {
//       filter.title = { $regex: title, $options: "i" }; // * partial, case-insensitive match
//     }
//     if (date) {
//       // const start = new Date(date);
//       // const end = new Date(date);
//       // end.setDate(end.getDate() + 1);
//       // filter.date = { $gte: start, $lt: end };
//       filter.date = date;
//     }
//     if (barangayId) {
//       filter.barangayId = barangayId;
//     }

//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     const budgets = await Budget.find(filter)
//       .sort({ date: -1 }) // * Sort by date DESCENDING (latest first)
//       .skip(skip)
//       .limit(limitNumber);

//     const total = await Budget.countDocuments(filter);

//     res.json({
//       success: true,
//       message: "Budgets retrieved",
//       data: budgets,
//       meta: {
//         total,
//         page: pageNumber,
//         limit: limitNumber,
//         totalPages: Math.ceil(total / limitNumber),
//       },
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

const getBudgets = async (req, res) => {
  try {
    const { page = 1, limit = 10, title, barangayId, date } = req.query;

    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }
    if (barangayId) {
      filter.barangayId = barangayId;
    }

    // Step 1: Get all distinct years from `date` field
    const yearsAgg = await Budget.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    const yearList = yearsAgg.map((y) => y._id);

    // Step 2: Apply year filter if provided
    let selectedYear = null;
    if (date) {
      selectedYear = parseInt(date);
      if (!isNaN(selectedYear)) {
        const startOfYear = new Date(`${selectedYear}-01-01T00:00:00Z`);
        const endOfYear = new Date(`${selectedYear}-12-31T23:59:59Z`);
        filter.date = { $gte: startOfYear, $lte: endOfYear };
      }
    }

    // Step 3: Apply pagination
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const [budgets, total] = await Promise.all([
      Budget.find(filter).sort({ date: -1 }).skip(skip).limit(limitNumber),
      Budget.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: selectedYear
        ? `Budgets retrieved for year ${selectedYear}`
        : "Budgets retrieved",
      data: budgets,
      years: yearList,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        year: selectedYear,
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

const updateBudget = async (req, res) => {
  try {
    const budgetId = req.params.id;

    const existingBudget = await Budget.findById(budgetId);

    if (!existingBudget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    const { title, date, barangayId } = req.body;

    const hasMissingFields = nullChecker(res, {
      title,
      date,
      barangayId,
    });
    console.log(hasMissingFields);
    if (hasMissingFields) return;

    let isDup = await checkDuplicate(
      res,
      Budget,
      {
        title,
        date,
      },
      budgetId
    );
    if (isDup) return;

    isDup = await checkDuplicate(res, Budget, {
      title,
    }, budgetId);
    if (isDup) return;

    const file = req.file?.filename || "N/A";
    const updates = { ...req.body };

    if (file && file !== "N/A") {
      // * delete old profile image
      if (existingBudget.file && existingBudget.file !== "N/A") {
        const oldPath = path.join("public/files", existingBudget.file);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.file = file;
    } else {
      const oldPath = path.join("public/files", existingBudget.file);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      updates.file = "N/A";
    }

    const updatedBudget = await Budget.findByIdAndUpdate(budgetId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    const deleteFile = (filename) => {
      if (filename && filename !== "N/A") {
        const filePath = path.join("public/files", filename);
        if (fs.existsSync(filePath)) {
          // * check if file exists
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filename}`);
        } else {
          console.log(`File not found: ${filename}`);
        }
      }
    };

    deleteFile(budget.file);

    await Budget.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Budget data and image deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export { createBudget, getBudget, getBudgets, updateBudget, deleteBudget };

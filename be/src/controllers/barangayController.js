import { Barangay } from "../models/barangayModel.js";
import { User } from "../models/userModel.js";
import { FileRequest } from "../models/fileRequestModel.js";
import mongoose from "mongoose";

const createBarangay = async (req, res) => {
  try {
    let barangay = new Barangay(req.body);
    
    await barangay.save();

    res.status(201).json({
      success: true,
      message: "Barangay created successfully",
      data: barangay,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getBarangay = async (req, res) => {
  try {
    const barangay = await Barangay.findById(req.params.id);
    if (!barangay)
      return res
        .status(404)
        .json({ success: false, message: "Barangay not found" });
    res.json({ success: true, message: "Barangay retrieved", data: barangay });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getBarangays = async (req, res) => {
  try {
    const barangays = await Barangay.find();
    res.json({
      success: true,
      message: "Barangays retrieved",
      data: barangays,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getBarangayReports = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = {};

    if (id) {
      filter.barangayId = new mongoose.Types.ObjectId(id);
    }

    // * filter by barangayId if present
    const stats = await FileRequest.aggregate([
      { $match: filter || {} },

      {
        $facet: {
          // * total number of requests
          totalCount: [{ $count: "count" }],

          // * count by status
          statusCounts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],

          // * count by document type
          typeCounts: [
            {
              $group: {
                _id: "$requestedDocumentType",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // * destructure and handle the result
    const total = stats[0].totalCount[0]?.count || 0;
    const statusCounts = stats[0].statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const typeDistribution = stats[0].typeCounts.map((item) => {
      const percentage =
        total > 0 ? ((item.count / total) * 100).toFixed(2) : "0.00";
      return {
        type: item._id,
        count: item.count,
        percentage: `${percentage}%`,
      };
    });

    const totalUsers = await User.countDocuments(filter);
    const data = {
      users: totalUsers,
      requests: {
        total,
        statusCounts,
        typeDistribution,
      },
    };
    console.log("REPORTS : ", data);

    res.json({
      success: true,
      message: "Barangay Reports retrieved",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const updateBarangay = async (req, res) => {
  try {
    const barangayId = req.params.id;

    const updatedBarangay = await Barangay.findByIdAndUpdate(
      barangayId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBarangay) {
      return res
        .status(404)
        .json({ success: false, message: "Barangay not found" });
    }

    res.json({
      success: true,
      message: "Barangay updated successfully",
      data: updatedBarangay,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteBarangay = async (req, res) => {
  try {
    const barangay = await Barangay.findByIdAndDelete(req.params.id);
    if (!barangay) {
      return res
        .status(404)
        .json({ success: false, message: "Barangay not found" });
    }

    res.json({
      success: true,
      message: "Barangay data deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export {
  createBarangay,
  getBarangay,
  getBarangays,
  updateBarangay,
  deleteBarangay,
  getBarangayReports,
};

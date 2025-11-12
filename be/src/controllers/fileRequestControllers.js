import { FileRequest } from "../models/fileRequestModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { nullChecker } from "../utils/nullChecker.js";
import { checkDuplicate } from "../utils/duplicateChecker.js";

// const createFileRequest = async (req, res) => {
//   try {
//     console.log(req.body);

//     const { requestedDocumentType, requestedBy, barangayId, data } = req.body;

//     let hasMissingFields = nullChecker(res, {
//       requestedDocumentType,
//       requestedBy,
//       barangayId,
//     });
//     if (hasMissingFields) return;

//     hasMissingFields = nullChecker(res, { ...data });
//     if (hasMissingFields) return;

//     const image = req.file?.filename || "N/A";

//     const fileRequest = new FileRequest({
//       ...req.body,
//       data: {
//         ...req.body.data,
//         image: image,
//       },
//     });

//     // let fileRequest = new FileRequest(req.body);

//     await fileRequest.save();

//     res.status(201).json({
//       success: true,
//       message: "File Request created successfully",
//       data: fileRequest,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

const createFileRequest = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { requestedDocumentType, requestedBy, barangayId } = req.body;

    // Validate top-level fields
    let hasMissingFields = nullChecker(res, {
      requestedDocumentType,
      requestedBy,
      barangayId,
    });
    if (hasMissingFields) return;

    // Parse data fields based on document type
    let data = {};
    if (requestedDocumentType === "barangay-clearance") {
      data = {
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        address: req.body.address,
        purok: req.body.purok,
        birthdate: req.body.birthdate,
        purpose: req.body.purpose,
        image: req.file?.filename || null,
        // noDerogatoryRecord: req.body.noDerogatoryRecord,
      };
    } else {
      data = req.body.data; // For other form types, assume data is a JSON object
    }

    // Validate data fields
    hasMissingFields = nullChecker(res, data);
    if (hasMissingFields) return;

    // Validate image for barangay-clearance
    if (requestedDocumentType === "barangay-clearance" && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required for barangay clearance",
      });
    }

    const fileRequest = new FileRequest({
      requestedDocumentType,
      requestedBy,
      barangayId,
      data,
    });

    await fileRequest.save();

    res.status(201).json({
      success: true,
      message: "File Request created successfully",
      data: fileRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getFileRequest = async (req, res) => {
  try {
    const fileRequest = await FileRequest.findById(req.params.id);
    if (!fileRequest)
      return res
        .status(404)
        .json({ success: false, message: "File Request not found" });
    res.json({
      success: true,
      message: "File Request retrieved",
      data: fileRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// const getFileRequests = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       requestNumber,
//       requestedDocumentType,
//       dateFrom,
//       dateTo,
//       search,
//       barangayId,
//       status,
//       requestedBy,
//     } = req.query;

//     const fileRequestFilter = {};

//     // * requestNumber
//     if (requestNumber) {
//       fileRequestFilter.requestNumber = Number(requestNumber);
//     }

//     // * requestedDocumentType
//     if (requestedDocumentType) {
//       fileRequestFilter.requestedDocumentType = new RegExp(
//         requestedDocumentType,
//         "i"
//       );
//     }

//     // * dateRequested between full days
//     if (dateFrom || dateTo) {
//       fileRequestFilter.dateRequested = {};
//       if (dateFrom) {
//         const start = new Date(dateFrom);
//         start.setHours(0, 0, 0, 0); // * 00:00:00.000
//         fileRequestFilter.dateRequested.$gte = start;
//       }
//       if (dateTo) {
//         const end = new Date(dateTo);
//         end.setHours(23, 59, 59, 999); // * 23:59:59.999
//         fileRequestFilter.dateRequested.$lte = end;
//       }
//     }

//     // * requestedBy via User fields
//     if (search) {
//       const userRegex = new RegExp(search, "i");
//       const matchedUsers = await User.find({
//         $or: [
//           { firstName: userRegex },
//           { lastName: userRegex },
//           { email: userRegex },
//         ],
//       }).select("_id");

//       const matchedUserIds = matchedUsers.map((user) => user._id);
//       fileRequestFilter.requestedBy = { $in: matchedUserIds };
//     }

//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     const fileRequests = await FileRequest.find(fileRequestFilter)
//       .populate("requestedBy", "firstName lastName email role")
//       .sort({ dateRequested: -1 })
//       .skip(skip)
//       .limit(limitNumber);

//     const total = await FileRequest.countDocuments(fileRequestFilter);

//     res.json({
//       success: true,
//       message: "File Requests retrieved",
//       data: fileRequests,
//       meta: {
//         total,
//         page: pageNumber,
//         limit: limitNumber,
//         totalPages: Math.ceil(total / limitNumber),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

const getFileRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      requestNumber,
      requestedDocumentType,
      dateFrom,
      dateTo,
      search,
      barangayId,
      status,
      requestedBy,
    } = req.query;

    const fileRequestFilter = {};

    // Filter: requestNumber
    if (requestNumber) {
      fileRequestFilter.requestNumber = Number(requestNumber);
    }

    if (barangayId) {
      fileRequestFilter.barangayId = new mongoose.Types.ObjectId(barangayId);
    }

    // // Filter: requestedDocumentType (case-insensitive)
    // if (requestedDocumentType) {
    //   fileRequestFilter.requestedDocumentType = new RegExp(
    //     requestedDocumentType,
    //     "i"
    //   );
    // }
    if (requestedDocumentType) {
      fileRequestFilter.requestedDocumentType = requestedDocumentType;
    }

    // Filter: status (exact match from enum)
    if (status) {
      fileRequestFilter.status = status.toLowerCase();
    }

    // Filter: requestedBy (direct user id)
    if (requestedBy) {
      fileRequestFilter.requestedBy = new mongoose.Types.ObjectId(requestedBy);
    }

    // Filter: dateRequested between dateFrom and dateTo
    if (dateFrom || dateTo) {
      fileRequestFilter.dateRequested = {};
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        fileRequestFilter.dateRequested.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        fileRequestFilter.dateRequested.$lte = end;
      }
    }

    // Filter: search on User fields
    if (search) {
      const userRegex = new RegExp(search, "i");
      const matchedUsers = await User.find({
        $or: [
          { firstName: userRegex },
          { lastName: userRegex },
          { email: userRegex },
        ],
      }).select("_id");

      const matchedUserIds = matchedUsers.map((user) => user._id);
      fileRequestFilter.requestedBy = { $in: matchedUserIds };
    }

    // Pagination setup
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch filtered and paginated data
    const fileRequests = await FileRequest.find(fileRequestFilter)
      .populate("requestedBy", "firstName lastName email role")
      .sort({ dateRequested: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await FileRequest.countDocuments(fileRequestFilter);

    res.json({
      success: true,
      message: "File Requests retrieved",
      data: fileRequests,
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

const updateFileRequest = async (req, res) => {
  try {
    const fileRequestId = req.params.id;
    console.log(req.body, fileRequestId);

    const { requestedDocumentType, requestedBy, barangayId, data } = req.body;

    if (!req.body.status) {
      let hasMissingFields = nullChecker(res, {
        requestedDocumentType,
        requestedBy,
        barangayId,
      });
      if (hasMissingFields) return;

      hasMissingFields = nullChecker(res, { ...data });
      if (hasMissingFields) return;
    }

    const updatedFileRequest = await FileRequest.findByIdAndUpdate(
      fileRequestId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFileRequest) {
      return res
        .status(404)
        .json({ success: false, message: "File Request not found" });
    }

    res.json({
      success: true,
      message: "File Request updated successfully",
      data: updatedFileRequest,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteFileRequest = async (req, res) => {
  try {
    const fileRequest = await FileRequest.findByIdAndDelete(req.params.id);
    if (!fileRequest) {
      return res
        .status(404)
        .json({ success: false, message: "File Request not found" });
    }

    res.json({
      success: true,
      message: "File Request data deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export {
  createFileRequest,
  getFileRequest,
  getFileRequests,
  updateFileRequest,
  deleteFileRequest,
};

import { ChatBot } from "../models/chatBotModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { nullChecker } from "../utils/nullChecker.js";
import { checkDuplicate } from "../utils/duplicateChecker.js";

// * import wss object exported from server.js
import { wss } from "../../app.js";
import WebSocket from "ws";

// * STEP 4.1 WS - once post request received from nodemcu,
// * notify clients (frontend) connected on web socket
const realtime = async (data) => {
  console.log("Data received:", data);

  // * Send the data to all connected clients
  // * return the data to the client (frontend)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          realTimeType: "chat",
          message: "New chat received",
          data: data,
          success: true,
        })
      );
    }
  });
};

const createChatBotMessage = async (req, res) => {
  try {
    console.log(req.body);

    const { message, userId } = req.body;

    const hasMissingFields = nullChecker(res, {
      message,
      userId,
    });
    console.log(hasMissingFields);
    if (hasMissingFields) return;

    let chatBot = new ChatBot(req.body);

    await chatBot.save();

    // * STEP 4.2 WS - notify clients (frontend) connected on web socket
    realtime(req.body); // * Call monitor with the received data

    res.status(201).json({
      success: true,
      message: "Chat Bot message created successfully",
      data: chatBot,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getChatBotMessage = async (req, res) => {
  try {
    const chatBotMessage = await ChatBot.findById(req.params.id);
    if (!chatBotMessage)
      return res
        .status(404)
        .json({ success: false, message: "Chat Bot Message not found" });
    res.json({
      success: true,
      message: "Chat Bot Message retrieved",
      data: chatBotMessage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// const getChatBotMessages = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       dateFrom,
//       dateTo,
//       search,
//       userId,
//       grouped,
//       barangayId,
//     } = req.query;

//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     const match = {};

//     // * Filter by date range
//     if (dateFrom || dateTo) {
//       match.date = {};
//       if (dateFrom) {
//         const start = new Date(dateFrom);
//         start.setHours(0, 0, 0, 0);
//         match.date.$gte = start;
//       }
//       if (dateTo) {
//         const end = new Date(dateTo);
//         end.setHours(23, 59, 59, 999);
//         match.date.$lte = end;
//       }
//     }

//     // * Filter by user search
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
//       match.userId = { $in: matchedUserIds };
//     }

//     // * Filter by specific userId
//     if (userId) {
//       match.userId = new mongoose.Types.ObjectId(userId);
//     }

//     if (grouped === "true") {
//       if (barangayId) {
//         match.user.barangayId = new mongoose.Types.ObjectId(barangayId);
//       }

//       // GROUPED MODE
//       const groupedMessages = await ChatBot.aggregate([
//         { $match: match },
//         {
//           $lookup: {
//             from: "users",
//             localField: "userId",
//             foreignField: "_id",
//             as: "user",
//           },
//         },
//         { $unwind: "$user" },
//         { $sort: { date: 1 } }, // sort messages by date
//         {
//           $group: {
//             _id: "$userId",
//             user: { $first: "$user" },
//             messages: {
//               $push: {
//                 message: "$message",
//                 from: "$from",
//                 date: "$date",
//               },
//             },
//           },
//         },
//         { $skip: skip },
//         { $limit: limitNumber },
//       ]);

//       const totalUsers = await ChatBot.distinct("userId", match);

//       return res.json({
//         success: true,
//         message: "Grouped ChatBot messages retrieved",
//         data: groupedMessages,
//         meta: {
//           total: totalUsers.length,
//           page: pageNumber,
//           limit: limitNumber,
//           totalPages: Math.ceil(totalUsers.length / limitNumber),
//         },
//       });
//     }

//     // DEFAULT (NON-GROUPED) MODE
//     const chatBotMessages = await ChatBot.find(match)
//       .populate("userId", "firstName lastName email role barangayId")
//       .sort({ date: 1 })
//       .skip(skip)
//       .limit(limitNumber);

//     const total = await ChatBot.countDocuments(match);

//     res.json({
//       success: true,
//       message: "Chat Bot Messages retrieved",
//       data: chatBotMessages,
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

// ! PREV
const getChatBotMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9999,
      dateFrom,
      dateTo,
      search,
      userId,
      grouped,
      barangayId,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let match = {};

    // * Filter by date range
    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        match.date.$gte = start;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    // * Filter by user search
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
      match.userId = { $in: matchedUserIds };
    }

    // * Filter by specific userId
    if (userId) {
      match.userId = new mongoose.Types.ObjectId(userId);
    }

    if (grouped === "true") {
      // GROUPED MODE
      const groupedMatch = {
        ...match,
        ...(barangayId && {
          "user.barangayId": new mongoose.Types.ObjectId(barangayId),
        }),
      };

      const groupedMessages = await ChatBot.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $match: groupedMatch },
        { $sort: { date: 1 } },
        {
          $group: {
            _id: "$userId",
            user: { $first: "$user" },
            messages: {
              $push: {
                message: "$message",
                from: "$from",
                date: "$date",
                status: "$status",
              },
            },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "unread"] },
                      { $eq: ["$from", "user"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $skip: skip },
        { $limit: limitNumber },
      ]);

      const totalUsers = await ChatBot.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $match: groupedMatch },
        { $group: { _id: "$userId" } },
      ]);

      return res.json({
        success: true,
        message: "Grouped ChatBot messages retrieved",
        data: groupedMessages,
        meta: {
          total: totalUsers.length,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalUsers.length / limitNumber),
        },
      });
    }

    // DEFAULT (NON-GROUPED) MODE
    if (!grouped && barangayId) {
      const barangayUsers = await User.find({
        barangayId: new mongoose.Types.ObjectId(barangayId),
      }).select("_id");

      const barangayUserIds = barangayUsers.map((u) => u._id);

      if (!match.userId) {
        match.userId = { $in: barangayUserIds };
      } else if (match.userId instanceof mongoose.Types.ObjectId) {
        // Intersect single userId with barangayId
        if (!barangayUserIds.some((id) => id.equals(match.userId))) {
          // No match between userId and barangay filter
          return res.json({
            success: true,
            message: "Chat Bot Messages retrieved",
            data: [],
            meta: {
              total: 0,
              page: pageNumber,
              limit: limitNumber,
              totalPages: 0,
            },
          });
        }
      } else if (match.userId.$in) {
        match.userId.$in = match.userId.$in.filter((id) =>
          barangayUserIds.some((bId) => bId.equals(id))
        );
        if (match.userId.$in.length === 0) {
          return res.json({
            success: true,
            message: "Chat Bot Messages retrieved",
            data: [],
            meta: {
              total: 0,
              page: pageNumber,
              limit: limitNumber,
              totalPages: 0,
            },
          });
        }
      }
    }

    const chatBotMessages = await ChatBot.find(match)
      .populate("userId", "firstName lastName email role barangayId")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await ChatBot.countDocuments(match);

    // * COUNT UNREAD MESSAGES OF ADMIN TO USER
    let unreadMessagesCount = 0;

    if (userId) {
      const unreadMessages = await ChatBot.find({
        userId: userId,
      }).populate("userId", "firstName lastName email role barangayId");
      if (!grouped) {
        unreadMessages.forEach((message) => {
          if (message.from === "chatbot" && message.status === "unread") {
            unreadMessagesCount++;
          }
        });
      }
    }

    res.json({
      success: true,
      message: "Chat Bot Messages retrieved",
      data: chatBotMessages,
      unreadMessagesCount,
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

const updateChatBotMessage = async (req, res) => {
  try {
    let chatBotMessageId = req.params.id;
    console.log(req.body, chatBotMessageId);

    const { message, userId, status, from } = req.body;

    if (!status) {
      const hasMissingFields = nullChecker(res, {
        message,
        userId,
      });
      console.log(hasMissingFields);
      if (hasMissingFields) return;
    }

    let updatedChatBotMessage = null;

    if (!status) {
      updatedChatBotMessage = await ChatBot.findByIdAndUpdate(
        chatBotMessageId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      updatedChatBotMessage = await ChatBot.updateMany(
        {
          userId,
          from: from,
        },
        {
          $set: { status: status },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    if (!updatedChatBotMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Chat Bot Message not found" });
    }

    res.json({
      success: true,
      message: "Chat Bot Message updated successfully",
      data: updatedChatBotMessage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteChatBotMessage = async (req, res) => {
  try {
    const chatBotMessage = await ChatBot.findByIdAndDelete(req.params.id);
    if (!chatBotMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Chat Bot Message not found" });
    }

    res.json({
      success: true,
      message: "Chat Bot Message data deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export {
  createChatBotMessage,
  getChatBotMessage,
  getChatBotMessages,
  updateChatBotMessage,
  deleteChatBotMessage,
};

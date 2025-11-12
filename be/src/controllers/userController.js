import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nullChecker } from "../utils/nullChecker.js";
import { checkDuplicate } from "../utils/duplicateChecker.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import mongoose from "mongoose";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// * forgot password
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Please input your email to send a confirmation code link",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid email!" });

//     res.json({
//       success: true,
//       message: "Confirmation link sent!",
//       data: user,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please input your email to send a confirmation link",
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid email!",
      });

    // Generate token and expiration
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 1000 * 60 * 15; // 15 minutes

    // Save token in user document (requires fields in schema)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Create transporter (example using Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL, // Your email
        pass: process.env.GMAIL_PK, // Your email app password (not your Gmail password!)
      },
    });

    // Reset link
    const resetLink = `https://brgy360-be.onrender.com/user/forgot-password/${resetToken}`;
    // const resetLink = `http://localhost:5173/user/forgot-password/${resetToken}`;

    // Send mail
    await transporter.sendMail({
      from: `"BRGY360" <${process.env.GMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password. This link is valid for 15 minutes:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({
      success: true,
      message: "Password reset link sent to email!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  console.log("RESET ATTEMPT:", req.body); // Add this

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  console.log("USER FOUND FOR TOKEN:", user); // Add this

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  console.log("PASSWORD RESET AND TOKEN CLEARED");

  res.json({ success: true, message: "Password successfully updated!" });
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    // Find the user with the matching reset token and check expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const verifyEmailRegistered = async (req, res) => {
  try {
    // * nulls
    const {
      firstName,
      middleName,
      lastName,
      sex,
      birthdate,
      age,
      email,
      phoneNumber,
      password,
      address,
      barangayId,
    } = req.body;

    console.log(req.body);

    // * Check for missing required fields
    const hasMissingFields = nullChecker(res, {
      firstName,
      middleName,
      lastName,
      sex,
      birthdate,
      age,
      email,
      phoneNumber,
      password,
      address,
      barangayId,
    });

    if (hasMissingFields) return;

    // * check duplicates
    let isDup = await checkDuplicate(res, User, { email: req.body.email });
    if (isDup) return;

    isDup = await checkDuplicate(res, User, {
      phoneNumber: req.body.phoneNumber,
    });
    if (isDup) return;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to send a verification code.",
      });
    }

    // * Generate 6-digit numeric code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // * Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PK,
      },
    });

    // * Send email with code
    await transporter.sendMail({
      from: `"BRGY360" <${process.env.GMAIL}>`,
      to: email,
      subject: "Your Email Verification Code",
      html: `
        <h3>Email Verification Code</h3>
        <p>Use the following code to verify your email</p>
        <h2>${verificationCode}</h2>
      `,
    });

    return res.json({
      success: true,
      message: "Verification code sent to your email.",
      data: verificationCode,
    });
  } catch (error) {
    console.error("Error in verifyEmailRegistered:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// * register new user
const registerUser = async (req, res) => {
  try {
    // * nulls
    const {
      firstName,
      middleName,
      lastName,
      sex,
      birthdate,
      age,
      email,
      phoneNumber,
      password,
      address,
      barangayId,
    } = req.body;

    // * Check for missing required fields
    const hasMissingFields = nullChecker(res, {
      firstName,
      middleName,
      lastName,
      sex,
      birthdate,
      age,
      email,
      phoneNumber,
      password,
      address,
      barangayId,
    });

    if (hasMissingFields) return;

    // * check duplicates
    let isDup = await checkDuplicate(res, User, { email: req.body.email });
    if (isDup) return;

    isDup = await checkDuplicate(res, User, {
      phoneNumber: req.body.phoneNumber,
    });
    if (isDup) return;

    // * Password Criteria Check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=~{}\[\]:;"'<>,.?/\\]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(409).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      });
    }

    // * checking of valid id files
    const files = req.files;
    const front = files["front"]?.[0]?.filename;
    const back = files["back"]?.[0]?.filename;
    const type = req.body.type;

    if (!type || !files || !front || !back) {
      return res.status(400).json({
        success: false,
        message: "Valid ID Type, Front, and Back images are required!",
      });
    }

    // * check age, it should be >= 15 years old
    if (age < 15) {
      return res.status(400).json({
        success: false,
        message:
          "Age should be greater than or equal to 15 years old to register!",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // * profile picture is the only one valid to be n/a or null
    const profile = files["profile"]?.[0]?.filename || "N/A";

    console.log(req.body.validId);

    const user = new User({
      ...req.body,
      password: hashedPassword,
      validId: {
        type,
        front,
        back,
      },
      profile: profile,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// * Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields!" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Get User by ID
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User retrieved", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// * Get All Users
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      sex,
      barangayId,
      search,
    } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (sex) filter.sex = sex;
    if (barangayId) filter.barangayId = new mongoose.Types.ObjectId(barangayId);

    // * name search
    if (search) {
      const searchRegex = new RegExp(search, "i"); // * case-insensitive regex
      filter.$or = [{ firstName: searchRegex }, { lastName: searchRegex }];
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limitNumber);

    const totalUsers = await User.countDocuments(filter);

    res.json({
      success: true,
      message: "Users retrieved",
      data: users,
      meta: {
        total: totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
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

// * Update User
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let updates = { ...req.body };

    // * nulls
    const {
      firstName,
      middleName,
      lastName,
      sex,
      birthdate,
      age,
      email,
      phoneNumber,
      address,
      barangayId,
    } = updates;

    // * Check for missing required fields
    if (!req.body.status) {
      const hasMissingFields = nullChecker(res, {
        firstName,
        middleName,
        lastName,
        sex,
        birthdate,
        age,
        email,
        phoneNumber,
        address,
        barangayId,
      });

      if (hasMissingFields) return;

      // * check for duplicate (excluding current)
      let isDup = await checkDuplicate(
        res,
        User,
        {
          email: updates.email,
        },
        userId
      );
      if (isDup) return;

      isDup = await checkDuplicate(
        res,
        User,
        {
          phoneNumber: updates.phoneNumber,
        },
        userId
      );
      if (isDup) return;
    }

    // * Password Criteria Check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=~{}\[\]:;"'<>,.?/\\]).{8,}$/;

    if (updates.password) {
      if (!passwordRegex.test(updates.password)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
        });
      }

      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // * check age, it should be >= 15 years old
    if (age < 15) {
      return res.status(400).json({
        success: false,
        message:
          "Age should be greater than or equal to 15 years old to register!",
      });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // * multiple image uploads
    const fileFields = ["profile", "front", "back"];
    for (const field of fileFields) {
      const file = req.files?.[field]?.[0];

      if (file) {
        // * new file uploaded
        if (field === "profile") {
          // * delete old profile image
          if (existingUser.profile && existingUser.profile !== "N/A") {
            const oldPath = path.join("public/images", existingUser.profile);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updates.profile = file.filename;
          console.log("IT GOES HERE ON PROFILE!");
        } else {
          // * front or back (nested in validId)
          const oldFile = existingUser.validId?.[field];
          if (oldFile && oldFile !== "N/A") {
            const oldPath = path.join("public/images", oldFile);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }

          if (!updates.validId) updates.validId = {};
          updates.validId[field] = file.filename;
          console.log("IT GOES HERE ON!", field);
        }
      }
      // else if (!req.body[field] || req.body[field] === "N/A") {
      // // * no file uploaded and client wants to remove the image
      // if (
      //   field === "profile" &&
      //   existingUser.profile &&
      //   existingUser.profile !== "N/A"
      // ) {
      //   const oldPath = path.join("public/images", existingUser.profile);
      //   if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      //   updates.profile = "N/A";
      // }
      // else if (
      //   (field === "front" || field === "back") &&
      //   existingUser.validId?.[field] &&
      //   existingUser.validId[field] !== "N/A"
      // ) {
      //   const oldPath = path.join(
      //     "public/images",
      //     existingUser.validId[field]
      //   );
      //   if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      //   if (!updates.validId) updates.validId = {};
      //   updates.validId[field] = "N/A";
      // }
      // }
    }

    // * checking of valid id files
    const files = req.files;
    const front = files["front"]?.[0]?.filename;
    const back = files["back"]?.[0]?.filename;
    const type = req.body.type;

    if (!req.body.status && !type) {
      return res.status(400).json({
        success: false,
        message: "Valid ID Type is required!",
      });
    }

    // * IF NO NEW FILES UPLOADED, RETAIN THE PREV ONE
    if (!req.body.status && (!front || !back)) {
      updates.validId = {
        front: existingUser.validId.front,
        back: existingUser.validId.back,
      };
    }

    if (!req.body.status && req.body.type) {
      if (!updates.validId) updates.validId = {};
      // updates.validId.type = req.body.validId.type;
      updates.validId.type = req.body.type;
    }

    console.log("VALID ID: ", updates.validId);

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// * Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // * utility function to delete a file if it exists
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

    // * Delete associated files
    deleteFile(user.profile);
    deleteFile(user.validId?.front);
    deleteFile(user.validId?.back);

    res.json({
      success: true,
      message: "User and associated files deleted successfully",
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
  loginUser,
  registerUser,
  updateUser,
  deleteUser,
  getUser,
  getUsers,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  verifyEmailRegistered,
};

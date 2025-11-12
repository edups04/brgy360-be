import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavbar from "../../../components/UserNavbar";
import { RiArrowLeftSLine, RiAddLine } from "react-icons/ri";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { renderAsync } from "docx-preview";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import PostModal from "../../../components/PostModal";
import Modal from "../../../components/Modal";
import RequestModal from "../../../components/RequestModal";
import BACKEND_API from "../../../utils/API";

const RequestForm = () => {
  const { state } = useLocation();
  const [requestModal, showRequestModal] = useState(false);
  const navigate = useNavigate();
  const [formType, setFormType] = useState("barangay-clearance");
  const [clearanceData, setClearanceData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    purok: "",
    birthdate: "",
    purpose: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file); // Store the file itself
    }
  };

  const [indigencyData, setIndigencyData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    purpose: "",
  });
  const [residencyData, setResidencyData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    purpose: "",
  });
  const [jobseekerData, setJobseekerData] = useState({
    honorifics: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    schoolName: "",
    // purpose: "",
  });

  const [requestedBy, setRequestedBy] = useState("");
  const [barangayId, setBarangayId] = useState("");

  const [postModal, showPostModal] = useState(false);
  const [modal, showModal] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  const isFormComplete = () => {
    const dataMap: Record<string, Record<string, string>> = {
      "barangay-clearance": clearanceData,
      "barangay-indigency": indigencyData,
      "certificate-of-residency": residencyData,
      "first-time-job-seeker": jobseekerData,
    };

    const selectedData = dataMap[formType];
    return Object.values(selectedData).every((value) => value.trim() !== "");
  };

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const currUser = JSON.parse(user);

      if (currUser) {
        setBarangayId(currUser.barangayId);
        setRequestedBy(currUser._id);
      }
    }

    if (state) {
      setFormType(state);
      autoFillUserFields(state);
    }
  }, []);

  const autoFillUserFields = async (state) => {
    // * SET AUTO FILL DATA ONCE THE USER CLICKS THE FORM
    const response = await axios.get(
      `${BACKEND_API}/users/${JSON.parse(localStorage.getItem("user"))._id}`
    );

    if (response.data.success) {
      let userData = response.data.data;

      const userProfile = await axios.get(
        `${BACKEND_API}/images/${userData.profile}`,
        { responseType: "blob" }
      );
      console.log("USER PROFILE : ", userProfile);

      switch (state) {
        case "barangay-clearance":
          setClearanceData({
            firstName: `${userData.firstName}`,
            middleName: `${userData.middleName}`,
            lastName: `${userData.lastName}`,
            address: userData.address,
            purok: "",
            // const purok = (userData.address.match(/Purok\s+[A-Za-z]+(?:\s+[A-Za-z]+)*/i) || [null])[0]?.replace(/[.,]$/, "");
            birthdate: new Date(userData.birthdate).toISOString().split("T")[0],
            purpose: "",
          });
          // * get image from user profile if available
          const imageBlob = userProfile.data;
          const imageFile = new File([imageBlob], userData.profile, {
            type: imageBlob.type,
          });
          setImage(imageFile);
          break;
        case "barangay-indigency":
          setIndigencyData({
            firstName: `${userData.firstName}`,
            middleName: `${userData.middleName}`,
            lastName: `${userData.lastName}`,
            address: userData.address,
            purpose: "",
          });
          break;
        case "certificate-of-residency":
          setResidencyData({
            firstName: `${userData.firstName}`,
            middleName: `${userData.middleName}`,
            lastName: `${userData.lastName}`,
            address: userData.address,
            purpose: "",
          });
          break;
        case "first-time-job-seeker":
          setJobseekerData({
            firstName: `${userData.firstName}`,
            middleName: `${userData.middleName}`,
            lastName: `${userData.lastName}`,
            address: userData.address,
            schoolName: "",
            honorifics: userData.sex === "male" ? "Mr" : "Ms",
          });
          break;
      }
    }
  };

  const generateAndPreviewPdf = async () => {
    let res;

    if (formType === "barangay-clearance") {
      res = await fetch("/BARANGAY CLEARANCE.pdf");
    } else if (formType === "barangay-indigency") {
      res = await fetch("/BARANGAY INDIGENCY.pdf");
    } else if (formType === "certificate-of-residency") {
      res = await fetch("/CERTIFICATE OF RESIDENCY.pdf");
    } else if (formType === "first-time-job-seeker") {
      res = await fetch("/FIRST TIME JOB SEEKER.pdf");
    }

    if (!res) {
      console.error("Invalid form type:", formType);
      return;
    } else {
      console.log("MERON!");
    }

    const arrayBuffer = await res.arrayBuffer();

    // Load the template
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    // Fill in form fields based on form type
    if (formType === "barangay-clearance") {
      form
        .getTextField("fullName")
        ?.setText(
          `${clearanceData.firstName} ${clearanceData.middleName} ${clearanceData.lastName}`
        );
      form.getTextField("address")?.setText(clearanceData.address);
      form.getTextField("purok")?.setText(clearanceData.purok);
      form.getTextField("birthdate")?.setText(clearanceData.birthdate);
      form.getTextField("purpose")?.setText(clearanceData.purpose);
    } else if (formType === "barangay-indigency") {
      form
        .getTextField("fullName")
        ?.setText(
          `${indigencyData.firstName} ${indigencyData.middleName} ${indigencyData.lastName}`
        );
      form.getTextField("address")?.setText(indigencyData.address);
      form.getTextField("purpose")?.setText(indigencyData.purpose);
    } else if (formType === "certificate-of-residency") {
      form
        .getTextField("fullName")
        ?.setText(
          `${residencyData.firstName} ${residencyData.middleName} ${residencyData.lastName}`
        );
      form.getTextField("address")?.setText(residencyData.address);
      form.getTextField("purpose")?.setText(residencyData.purpose);
    } else if (formType === "first-time-job-seeker") {
      form
        .getTextField("fullName")
        ?.setText(
          `${jobseekerData.firstName} ${jobseekerData.middleName} ${jobseekerData.lastName}`
        );
      form.getTextField("address")?.setText(jobseekerData.address);
      form.getTextField("honorifics")?.setText(jobseekerData.honorifics);
      form.getTextField("schoolName")?.setText(jobseekerData.schoolName);
    }

    // Handle image field (assuming imageField is the name of the image field in the PDF)
    try {
      let imageFile = image;
      if (imageFile) {
        // Read the image file as an array buffer
        const imageBytes = await imageFile.arrayBuffer();

        // Determine image type and embed it
        let image;
        if (imageFile.type === "image/jpeg") {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (imageFile.type === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          console.error("Unsupported image format. Use JPEG or PNG.");
          return;
        }

        // Get the image field
        const imageField = form.getField("image"); // Replace with your actual field name

        if (imageField) {
          // Set the image in the field
          // @ts-ignore
          imageField.setImage(image);
        } else {
          console.error("Image field 'imageField' not found in the PDF.");
        }
      }
    } catch (error) {
      console.error("Error setting image in PDF:", error);
    }

    // Flatten to make fields non-editable
    form.flatten();

    // Save and preview
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  // const submitRequest = async () => {
  //   try {
  //     let url = `http://localhost:8080/api/file-requests`;

  //     const clearanceFormData = new FormData();
  //     if (formType === "barangay-clearance") {
  //       clearanceFormData.append("fullName", clearanceData.fullName);
  //       clearanceFormData.append("address", clearanceData.address);
  //       clearanceFormData.append("purok", clearanceData.purok);
  //       clearanceFormData.append("birthdate", clearanceData.birthdate);
  //       clearanceFormData.append("purpose", clearanceData.purpose);
  //       image && clearanceFormData.append("image", image);
  //     }

  //     let response = await axios.post(
  //       url,
  //       {
  //         requestedDocumentType: formType,
  //         requestedBy: requestedBy,
  //         data:
  //           formType === "barangay-clearance"
  //             ? clearanceFormData
  //             : formType === "barangay-indigency"
  //             ? indigencyData
  //             : formType === "certificate-of-residency"
  //             ? residencyData
  //             : formType === "first-time-job-seeker"
  //             ? jobseekerData
  //             : "",
  //         barangayId: barangayId,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     if (response.data.success === true) {
  //       setError(false);
  //       setMessage(response.data.message);
  //       showModal(true);
  //     }
  //   } catch (error: any) {
  //     showModal(true);
  //     setError(true);
  //     setMessage(error.response.data.message);
  //   }
  // };

  const submitRequest = async () => {
    try {
      let url = `${BACKEND_API}/file-requests`;
      // let url = `http://localhost:8080/api/file-requests`;

      let response;
      if (formType === "barangay-clearance") {
        const clearanceFormData = new FormData();
        clearanceFormData.append("requestedDocumentType", formType);
        clearanceFormData.append("requestedBy", requestedBy);
        clearanceFormData.append("barangayId", barangayId);
        clearanceFormData.append("firstName", clearanceData.firstName);
        clearanceFormData.append("middleName", clearanceData.middleName);
        clearanceFormData.append("lastName", clearanceData.lastName);
        clearanceFormData.append("address", clearanceData.address);
        clearanceFormData.append("purok", clearanceData.purok);
        clearanceFormData.append("birthdate", clearanceData.birthdate);
        clearanceFormData.append("purpose", clearanceData.purpose);
        if (image) {
          console.log("SAVING IMAGE: ", image);
          clearanceFormData.append("image", image);
        } else {
          console.error("No image selected for barangay clearance");
          setError(true);
          setMessage("Please select an image");
          showModal(true);
          return;
        }

        // Debug FormData contents
        for (let [key, value] of clearanceFormData.entries()) {
          console.log(`${key}:`, value);
        }

        response = await axios.post(url, clearanceFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const data =
          formType === "barangay-indigency"
            ? indigencyData
            : formType === "certificate-of-residency"
            ? residencyData
            : formType === "first-time-job-seeker"
            ? jobseekerData
            : {};

        response = await axios.post(
          url,
          {
            requestedDocumentType: formType,
            requestedBy: requestedBy,
            barangayId: barangayId,
            data,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.data.success === true) {
        setError(false);
        setMessage(response.data.message);
        showModal(true);
        // Call generateAndPreviewPdf with the original image
        if (formType === "barangay-clearance" && image) {
          // generateAndPreviewPdf(image);
          generateAndPreviewPdf();
        }
      }
    } catch (error) {
      console.error("Error submitting request:", error.response?.data || error);
      showModal(true);
      setError(true);
      setMessage(error.response?.data?.message || "Failed to submit request");
    }
  };

  const handleFormTypeChange = (e) => {
    setFormType(e.target.value);
    autoFillUserFields(e.target.value);
  };

  return (
    <>
      <UserNavbar />
      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]"></div>
        <div className="w-full flex flex-col items-center justify-center px-4 py-6 gap-6">
          {/* header */}
          <div className="w-full flex flex-row items-center justify-between">
            <div className="flex flex-row items-center justify-center gap-1">
              <RiArrowLeftSLine
                size={24}
                color="black"
                className="cursor-pointer"
                onClick={() => navigate("/user/request")}
              />
              <p className="text-sm font-semibold">File Request</p>
            </div>
            {/* type */}
            <select
              value={formType}
              onChange={handleFormTypeChange}
              className="text-sm font-normal outline-none border border-green-700 p-3 rounded-xl"
            >
              <option value="barangay-clearance">Barangay Clearance</option>
              <option value="barangay-indigency">Barangay Indigency</option>
              <option value="certificate-of-residency">
                Certificate of Residency
              </option>
              <option value="first-time-job-seeker">
                First Time Job Seeker
              </option>
            </select>
          </div>
          {/* inputs */}
          {formType === "barangay-clearance" ? (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  First Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="firstName"
                  value={clearanceData.firstName}
                  onChange={(e) =>
                    setClearanceData({
                      ...clearanceData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Middle Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="middleName"
                  value={clearanceData.middleName}
                  onChange={(e) =>
                    setClearanceData({
                      ...clearanceData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Last Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="lastName"
                  value={clearanceData.lastName}
                  onChange={(e) =>
                    setClearanceData({
                      ...clearanceData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Address{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="address"
                  value={clearanceData.address}
                  onChange={(e) =>
                    setClearanceData({
                      ...clearanceData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="address"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Purok{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="purok"
                  value={clearanceData.purok}
                  onChange={(e) =>
                    setClearanceData({
                      ...clearanceData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="purok"
                />
                <div className="w-full flex flex-col items-start justify-center gap-2">
                  <p className="text-sm font-normal">
                    Birthdate{" "}
                    <span className="text-red-600 font-bold text-lg">*</span>
                  </p>
                  <input
                    type="date"
                    name="birthdate"
                    value={clearanceData.birthdate}
                    onChange={(e) =>
                      setClearanceData({
                        ...clearanceData,
                        [e.target.name]: e.target.value,
                      })
                    }
                    className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                    placeholder="birth day"
                  />
                </div>
                <div className="w-full flex flex-col items-start justify-center gap-2">
                  <p className="text-sm font-normal">
                    Purpose{" "}
                    <span className="text-red-600 font-bold text-lg">*</span>
                  </p>
                  <input
                    type="text"
                    name="purpose"
                    value={clearanceData.purpose}
                    onChange={(e) =>
                      setClearanceData({
                        ...clearanceData,
                        [e.target.name]: e.target.value,
                      })
                    }
                    className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                    placeholder="purpose"
                  />
                </div>
                <div className="w-full max-w-[350px] h-[150px] lg:h-[350px] bg-gray-200 flex items-center justify-center rounded-xl overflow-hidden relative">
                  {image && (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="preview"
                      className="h-full w-full object-cover object-center"
                    />
                  )}
                  <label className="absolute bottom-4 right-4 p-3 rounded-xl bg-white cursor-pointer">
                    <RiAddLine size={16} color="black" />
                    <span className="text-red-600 text-xs">Required</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : formType === "barangay-indigency" ? (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  First Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="firstName"
                  value={indigencyData.firstName}
                  onChange={(e) =>
                    setIndigencyData({
                      ...indigencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Middle Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="middleName"
                  value={indigencyData.middleName}
                  onChange={(e) =>
                    setIndigencyData({
                      ...indigencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  last Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="lastName"
                  value={indigencyData.lastName}
                  onChange={(e) =>
                    setIndigencyData({
                      ...indigencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>

              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Address{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="address"
                  value={indigencyData.address}
                  onChange={(e) =>
                    setIndigencyData({
                      ...indigencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="address"
                />
              </div>

              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Purpose{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="purpose"
                  value={indigencyData.purpose}
                  onChange={(e) =>
                    setIndigencyData({
                      ...indigencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="purpose"
                />
              </div>
            </div>
          ) : formType === "certificate-of-residency" ? (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  First Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="firstName"
                  value={residencyData.firstName}
                  onChange={(e) =>
                    setResidencyData({
                      ...residencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Middle Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="middleName"
                  value={residencyData.middleName}
                  onChange={(e) =>
                    setResidencyData({
                      ...residencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  last Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="lastName"
                  value={residencyData.lastName}
                  onChange={(e) =>
                    setResidencyData({
                      ...residencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>

              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Address{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="address"
                  value={residencyData.address}
                  onChange={(e) =>
                    setResidencyData({
                      ...residencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="address"
                />
              </div>

              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Purpose{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="purpose"
                  value={residencyData.purpose}
                  onChange={(e) =>
                    setResidencyData({
                      ...residencyData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="purpose"
                />
              </div>
            </div>
          ) : formType === "first-time-job-seeker" ? (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Honorifics{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="honorifics"
                  value={jobseekerData.honorifics}
                  onChange={(e) =>
                    setJobseekerData({
                      ...jobseekerData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="honorifics"
                />
              </div>

              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  First Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="firstName"
                  value={jobseekerData.firstName}
                  onChange={(e) =>
                    setJobseekerData({
                      ...jobseekerData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Middle Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="middleName"
                  value={jobseekerData.middleName}
                  onChange={(e) =>
                    setJobseekerData({
                      ...jobseekerData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  last Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="lastName"
                  value={jobseekerData.lastName}
                  onChange={(e) =>
                    setJobseekerData({
                      ...jobseekerData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="full name"
                />
              </div>

              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  Address{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="address"
                  value={jobseekerData.address}
                  onChange={(e) =>
                    setJobseekerData({
                      ...jobseekerData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="address"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">
                  School Name{" "}
                  <span className="text-red-600 font-bold text-lg">*</span>
                </p>
                <input
                  type="text"
                  name="schoolName"
                  value={jobseekerData.schoolName}
                  onChange={(e) =>
                    setJobseekerData({
                      ...jobseekerData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                  placeholder="school name"
                />
                {/* <div className="w-full flex flex-col items-start justify-center gap-2">
                  <p className="text-sm font-normal">Purpose</p>
                  <input
                    type="text"
                    name="purpose"
                    value={jobseekerData.purpose}
                    onChange={(e) =>
                      setJobseekerData({
                        ...jobseekerData,
                        [e.target.name]: e.target.value,
                      })
                    }
                    className="w-full outline-none border border-green-700 text-sm font-normal p-3 rounded-xl"
                    placeholder="purpose"
                  />
                </div> */}
              </div>
            </div>
          ) : null}
          <div className="w-full flex flex-row items-center justify-end gap-4">
            {isFormComplete() ? (
              <button
                className="p-3 rounded-xl bg-green-700 text-sm font-normal text-white"
                onClick={() => showRequestModal(true)}
              >
                Submit Request
              </button>
            ) : (
              <button className="p-3 rounded-xl bg-green-700/20 text-sm font-normal text-white">
                Submit Request
              </button>
            )}
            <button
              onClick={generateAndPreviewPdf}
              className="p-3 bg-green-700 text-white rounded-xl text-sm font-normal"
            >
              View File
            </button>
          </div>
        </div>
      </div>
      {requestModal && (
        <RequestModal
          onClose={() => {
            showRequestModal(false);
          }}
          onPost={submitRequest}
        />
      )}

      {modal && (
        <Modal
          message={message}
          error={error}
          onClose={() => {
            showModal(false);
            showPostModal(false);
            if (!error) {
              navigate("/user/request");
            }
          }}
        />
      )}
    </>
  );
};

export default RequestForm;

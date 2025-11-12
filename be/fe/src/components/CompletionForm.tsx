import axios from "axios";
import { PDFDocument } from "pdf-lib";
import React, { useEffect, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import Modal from "./Modal";
import BACKEND_API from "../utils/API";

const CompletionForm = ({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) => {
  const [placeOfIssuance, setPlaceOfIssuance] = useState("");
  const [residentCertificateNumber, setResidentCertificateNumber] = useState(0);
  const [noDerogatoryRecord, setNoDerogatoryRecord] = useState(false);

  const [modal, showModal] = useState(false);
  const [error, setError] = useState(true);
  const [message, setMessage] = useState("");

  const handleCheckboxChange = (e) => {
    setNoDerogatoryRecord(e.target.checked);
    // console.log("No Derogatory Record checked:", e.target.checked);
  };

  useEffect(() => {
    console.log("DATA", data);
  }, []);

  const generateAndPreviewPdf = async () => {
    console.log(data);

    let res;

    if (data.requestedDocumentType === "barangay-clearance") {
      res = await fetch("/BARANGAY CLEARANCE.pdf");
    } else if (data.requestedDocumentType === "barangay-indigency") {
      res = await fetch("/BARANGAY INDIGENCY.pdf");
    } else if (data.requestedDocumentType === "certificate-of-residency") {
      res = await fetch("/CERTIFICATE OF RESIDENCY.pdf");
    } else if (data.requestedDocumentType === "first-time-job-seeker") {
      res = await fetch("/FIRST TIME JOB SEEKER.pdf");
    }

    if (!res) {
      console.error("Invalid form type:", data.requestedDocumentType);
      return;
    }

    const arrayBuffer = await res.arrayBuffer();

    // Load the template
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    const isoDate = data.dateRequested;
    const date = new Date(isoDate);

    const formattedDate = `${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}-${date.getFullYear()}`;

    // Fill in form fields based on form type
    if (data.requestedDocumentType === "barangay-clearance") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("purok")?.setText(data.data.purok);
      form.getTextField("birthdate")?.setText(data.data.birthdate);
      form
        .getTextField("noDerogatoryRecord")
        ?.setText(noDerogatoryRecord ? "NO DEROGATORY RECORD" : "");
      form.getTextField("purpose")?.setText(data.data.purpose);
      form.getTextField("dateRequested")?.setText(formattedDate);
      // form
      //   .getTextField("requestNumber")
      //   ?.setText(data.requestNumber.toString());
      form
        .getTextField("requestNumber")
        ?.setText(residentCertificateNumber.toString());
      data.issuanceDate === "N/A"
        ? form.getTextField("issuanceDate")?.setText("")
        : form.getTextField("issuanceDate")?.setText(data.issuanceDate);
      data.placeOfIssuance === "N/A"
        ? form.getTextField("placeOfIssuance")?.setText("")
        : form.getTextField("placeOfIssuance")?.setText(data.placeOfIssuance);
    } else if (data.requestedDocumentType === "barangay-indigency") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("purpose")?.setText(data.data.purpose);
      form.getTextField("dateRequested")?.setText(formattedDate);
    } else if (data.requestedDocumentType === "certificate-of-residency") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("purpose")?.setText(data.data.purpose);
      form.getTextField("dateRequested")?.setText(formattedDate);
    } else if (data.requestedDocumentType === "first-time-job-seeker") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("honorifics")?.setText(data.data.honorifics);
      form.getTextField("schoolName")?.setText(data.data.schoolName);
      form.getTextField("purpose")?.setText(data.data.fullName);
      form.getTextField("dateRequested")?.setText(formattedDate);
    }

    try {
      if (
        data.data.image &&
        data.data.image !== "N/A" &&
        data.requestedDocumentType === "barangay-clearance"
      ) {
        // Fetch the image from the server
        const response = await axios.get(
          `${BACKEND_API}/images/${data.data.image}`,
          { responseType: "arraybuffer" } // Ensure response is an array buffer
        );

        console.log("IMAGE FROM SERVER:", response);

        // Get the image bytes and MIME type
        const imageBytes = response.data;
        const mimeType = response.headers["content-type"];

        // Embed the image based on MIME type
        let embeddedImage;
        if (mimeType === "image/jpeg") {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else if (mimeType === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          console.error("Unsupported image format. Use JPEG or PNG.");
          return;
        }

        // Get the image field
        const imageField = form.getField("image"); // Use "imageField" if that's the correct name

        if (imageField) {
          // Set the image in the field
          // @ts-ignore
          imageField.setImage(embeddedImage);
        } else {
          console.error("Image field 'image' not found in the PDF.");
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

  const printPdf = async (data: any) => {
    console.log(data);

    let res;

    if (data.requestedDocumentType === "barangay-clearance") {
      res = await fetch("/BARANGAY CLEARANCE.pdf");
    } else if (data.requestedDocumentType === "barangay-indigency") {
      res = await fetch("/BARANGAY INDIGENCY.pdf");
    } else if (data.requestedDocumentType === "certificate-of-residency") {
      res = await fetch("/CERTIFICATE OF RESIDENCY.pdf");
    } else if (data.requestedDocumentType === "first-time-job-seeker") {
      res = await fetch("/FIRST TIME JOB SEEKER.pdf");
    }

    if (!res) {
      console.error("Invalid form type:", data.requestedDocumentType);
      return;
    }

    const arrayBuffer = await res.arrayBuffer();

    // Load the template
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    const isoDate = data.dateRequested;
    const date = new Date(isoDate);

    const formattedDate = `${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}-${date.getFullYear()}`;

    // Fill in form fields based on form type
    if (data.requestedDocumentType === "barangay-clearance") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("purok")?.setText(data.data.purok);
      form.getTextField("birthdate")?.setText(data.data.birthdate);
      form.getTextField("purpose")?.setText(data.data.purpose);
      form
        .getTextField("noDerogatoryRecord")
        ?.setText(noDerogatoryRecord ? "NO DEROGATORY RECORD" : "");
      form.getTextField("dateRequested")?.setText(formattedDate);
      form
        .getTextField("requestNumber")
        ?.setText(residentCertificateNumber.toString());
      // form
      //   .getTextField("requestNumber")
      //   ?.setText(data.requestNumber.toString());
      data.issuanceDate === "N/A"
        ? form.getTextField("issuanceDate")?.setText("")
        : form.getTextField("issuanceDate")?.setText(data.issuanceDate);
      data.placeOfIssuance === "N/A"
        ? form.getTextField("placeOfIssuance")?.setText("")
        : form.getTextField("placeOfIssuance")?.setText(data.placeOfIssuance);
    } else if (data.requestedDocumentType === "barangay-indigency") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("purpose")?.setText(data.data.purpose);
      form.getTextField("dateRequested")?.setText(formattedDate);
      form.getTextField("validUntil")?.setText(data.data.validUntil);
    } else if (data.requestedDocumentType === "certificate-of-residency") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("purpose")?.setText(data.data.purpose);
      form.getTextField("dateRequested")?.setText(formattedDate);
    } else if (data.requestedDocumentType === "first-time-job-seeker") {
      form
        .getTextField("fullName")
        ?.setText(
          `${data.data.firstName} ${data.data.middleName} ${data.data.lastName}`
        );
      form.getTextField("address")?.setText(data.data.address);
      form.getTextField("honorifics")?.setText(data.data.honorifics);
      form.getTextField("schoolName")?.setText(data.data.schoolName);
      form.getTextField("purpose")?.setText(data.data.fullName);
      form.getTextField("dateRequested")?.setText(formattedDate);
    }

    try {
      if (
        data.data.image &&
        data.data.image !== "N/A" &&
        data.requestedDocumentType === "barangay-clearance"
      ) {
        // Fetch the image from the server
        const response = await axios.get(
          `${BACKEND_API}/images/${data.data.image}`,
          { responseType: "arraybuffer" } // Ensure response is an array buffer
        );

        console.log("IMAGE FROM SERVER:", response);

        // Get the image bytes and MIME type
        const imageBytes = response.data;
        const mimeType = response.headers["content-type"];

        // Embed the image based on MIME type
        let embeddedImage;
        if (mimeType === "image/jpeg") {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else if (mimeType === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          console.error("Unsupported image format. Use JPEG or PNG.");
          return;
        }

        // Get the image field
        const imageField = form.getField("image"); // Use "imageField" if that's the correct name

        if (imageField) {
          // Set the image in the field
          // @ts-ignore
          imageField.setImage(embeddedImage);
        } else {
          console.error("Image field 'image' not found in the PDF.");
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

  const printRequest = async () => {
    try {
      let url = `${BACKEND_API}/file-requests/${data._id}`;
      // let url = `http://localhost:8080/api/file-requests/${data._id}`;

      const today = new Date();
      const formatted = today.toISOString().split("T")[0];

      const validUntilDate = new Date();
      validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);

      const mm = String(validUntilDate.getMonth() + 1).padStart(2, "0");
      const dd = String(validUntilDate.getDate()).padStart(2, "0");
      const yyyy = validUntilDate.getFullYear();

      const validUntil = `${mm}-${dd}-${yyyy}`;

      let updatedData = {
        ...data.data,
        validUntil: validUntil,
        noDerogatoryRecord: noDerogatoryRecord ? "NO DEROGATORY RECORD" : "",
      };

      let response = await axios.put(url, {
        placeOfIssuance: placeOfIssuance,
        status: "completed",
        issuanceDate: formatted,
        data: updatedData,
        residentCertificateNumber: residentCertificateNumber,
      });

      if (response.data.success === true) {
        await printPdf(response.data.data);
        showModal(true);
        setError(false);
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setError(true);
      showModal(true);
      setMessage(error.response.data.message);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 bg-black/20 w-full h-screen flex flex-col items-center justify-start p-6 overflow-y-auto">
        <div className="w-full lg:w-2/5 bg-white p-6 rounded-2xl flex flex-col items-center justify-center gap-6">
          {/* top */}
          <div className="w-full flex flex-row items-center justify-between">
            <p className="text-sm font-semibold w-1/2 text-left truncate">
              Completion Form
            </p>
            <RiCloseLine
              size={16}
              color="black"
              className="cursor-pointer"
              onClick={onClose}
            />
          </div>
          {/* input */}
          {data.requestedDocumentType === "barangay-clearance" && (
            <>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Place of Issuance</p>
                <input
                  type="text"
                  value={placeOfIssuance}
                  onChange={(e) => setPlaceOfIssuance(e.target.value)}
                  placeholder="place of issuance"
                  className="text-sm font-normal outline-none border border-green-700 p-3 rounded-xl w-full"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Resident Certificate No</p>
                <input
                  type="number"
                  min={0}
                  value={residentCertificateNumber}
                  onChange={(e) => {
                    // @ts-ignore
                    setResidentCertificateNumber(e.target.value);
                  }}
                  placeholder="place of issuance"
                  className="text-sm font-normal outline-none border border-green-700 p-3 rounded-xl w-full"
                />
              </div>
              <div className="w-max flex flex-row items-center gap-2 border border-green-700 p-2 py-3 rounded-xl self-start">
                <label
                  htmlFor="noDerogatoryRecord"
                  className="text-sm font-bold text-green-700"
                >
                  No Derogatory Record
                </label>
                <input
                  id="noDerogatoryRecord"
                  type="checkbox"
                  name="noDerogatoryRecord"
                  checked={noDerogatoryRecord}
                  onChange={handleCheckboxChange}
                />
              </div>
            </>
          )}

          {/* buttons */}
          <div className="w-full flex flex-row items-center justify-end gap-2">
            <button
              className="text-sm font-normal text-white bg-green-700 p-3 rounded-xl"
              onClick={() => generateAndPreviewPdf()}
            >
              Preview
            </button>
            {(placeOfIssuance && residentCertificateNumber > 0) ||
            data.requestedDocumentType !== "barangay-clearance" ? (
              <button
                className="text-sm font-normal text-white bg-green-700 p-3 rounded-xl"
                onClick={() => printRequest()}
              >
                Print
              </button>
            ) : (
              <button className="text-sm font-normal text-white bg-green-700/10 p-3 rounded-xl">
                Print
              </button>
            )}
          </div>
        </div>
      </div>
      {modal && (
        <Modal
          message={message}
          error={error}
          onClose={() => {
            showModal(false);
            if (!error) {
              onClose();
            }
          }}
        />
      )}
    </>
  );
};

export default CompletionForm;

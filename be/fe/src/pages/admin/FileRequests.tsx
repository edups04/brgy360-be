import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { RiSearchLine } from "react-icons/ri";
import { useRequests } from "../../providers/RequestsProvider";
import axios from "axios";
import Modal from "../../components/Modal";
import { PDFDocument } from "pdf-lib";
import DeleteModal from "../../components/DeleteModal";
import CompletionForm from "../../components/CompletionForm";
import BACKEND_API from "../../utils/API";
import UserApproval from "../../components/UserApproval";

const FileRequests = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [status, setStatus] = useState("");
  const [formType, setFormType] = useState("");

  const { requests, getRequests, totalPages } = useRequests();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [modal, showModal] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState("");
  const [completionForm, showCompletionForm] = useState(false);
  const [data, setData] = useState<any>(null);
  const [approvalForm, showApprovalForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    if (page > totalPages && totalPages !== 0) {
      setPage(page - 1);
    }
  }, [page, totalPages]);

  const getData = async () => {
    const user = localStorage.getItem("user");

    if (user) {
      const currUser = JSON.parse(user);

      if (currUser) {
        await getRequests(
          search,
          currUser.barangayId,
          status,
          formType,
          page,
          limit
        );
      }
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      let url = `${BACKEND_API}/file-requests/${requestId}`;

      let response = await axios.put(url, {
        status: "approved",
      });

      if (response.data.success === true) {
        showModal(true);
        setError(false);
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setError(true);
      setMessage(error.response.data.message);
      showModal(true);
    }
  };

  useEffect(() => {
    getData();
  }, [status, search, formType, page]);

  const generateAndPreviewPdf = async (data: any) => {
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
      form.getTextField("dateRequested")?.setText(formattedDate);
      form
        .getTextField("noDerogatoryRecord")
        ?.setText(data.data.noDerogatoryRecord);
      form
        .getTextField("requestNumber")
        ?.setText(data.residentCertificateNumber.toString());
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
      data.data.validUntil &&
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

  const deleteRequest = async (requestId: string) => {
    try {
      let url = `${BACKEND_API}/file-requests/${requestId}`;
      // let url = `http://localhost:8080/api/file-requests/${requestId}`;

      let response = await axios.delete(url);

      if (response.data.success === true) {
        showModal(true);
        setError(false);
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setError(true);
      setMessage(error.response.data.message);
      showModal(true);
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      let url = `${BACKEND_API}/file-requests/${requestId}`;
      // let url = `http://localhost:8080/api/file-requests/${requestId}`;

      let response = await axios.put(url, {
        status: "declined",
      });

      if (response.data.success === true) {
        showModal(true);
        setError(false);
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setError(true);
      setMessage(error.response.data.message);
      showModal(true);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="flex flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]"></div>
        <div className="w-full flex flex-col items-center justify-center gap-6 px-4 py-6">
          {/* title */}
          <div className="w-full flex flex-row items-center justify-between">
            <div className="w-1/2 flex flex-col items-start justify-center">
              <p className="text-sm font-semibold">File Requests</p>
              <p className="text-sm font-normal w-full truncate">
                Update, approve and monitor file requests
              </p>
            </div>
            <select
              className="outline-none bg-green-700 text-white p-3 rounded-xl text-sm font-normal"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="w-full flex flex-row gap-4 items-center justify-start">
            <div className="relative w-3/5 lg:w-3/5 flex items-center justify-center">
              <input
                type="text"
                className="w-full outline-none border border-green-700 pl-10 pr-3 py-3 rounded-xl text-sm font-normal truncate"
                placeholder="search for requests"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <RiSearchLine
                size={16}
                color="black"
                className="absolute left-4"
              />
            </div>
            <select
              className="outline-none bg-green-700 text-white p-3 rounded-xl text-sm font-normal"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
            >
              <option value="">All</option>
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
          <table className="w-full border-collapse border border-black/10">
            <thead>
              <tr>
                <th className="border border-black/10 text-left text-sm font-semibold p-2">
                  Request No.
                </th>
                <th className="border border-black/10 text-left hidden lg:table-cell text-sm font-semibold p-2">
                  Requested By
                </th>
                <th className="border border-black/10 text-left hidden lg:table-cell text-sm font-semibold p-2">
                  Document Type
                </th>
                <th className="border border-black/10 text-left text-sm font-semibold p-2">
                  Document and ID
                </th>
                <th className="border border-black/10 text-left text-sm font-semibold p-2">
                  Status
                </th>
                <th className="border border-black/10 text-left text-sm font-semibold p-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request: any) => (
                  <tr key={request._id}>
                    <td className="border border-black/10 text-left text-sm font-normal p-3">
                      <div className="w-full flex flex-wrap items-center justify-start gap-2">
                        <p className="text-sm font-normal">
                          {request.requestNumber}
                        </p>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell border border-black/10 text-left text-sm font-normal p-3">
                      <p className="text-sm font-normal capitalize">
                        {request.requestedBy
                          ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}`
                          : "Not Found"}
                      </p>
                    </td>
                    <td className="hidden lg:table-cell border border-black/10 text-left text-sm font-normal p-3">
                      {request.requestedDocumentType === "barangay-clearance"
                        ? "Barangay Clearance"
                        : request.requestedDocumentType === "barangay-indigency"
                        ? "Barangay Indigency"
                        : request.requestedDocumentType ===
                          "certificate-of-residency"
                        ? "Certificate of Residency"
                        : request.requestedDocumentType ===
                          "first-time-job-seeker"
                        ? "First Time Job Seeker"
                        : ""}
                    </td>
                    <td className="h-16 p-3">
                      <div className="flex flex-row gap-1 justify-between items-center h-full">
                        <p
                          className="text-green-700 text-sm font-semibold cursor-pointer"
                          onClick={() => generateAndPreviewPdf(request)}
                        >
                          View File
                        </p>
                        <p
                          className="text-green-700 text-sm font-semibold cursor-pointer"
                          onClick={() => {
                            setSelectedUser(request.requestedBy._id);
                            showApprovalForm(true);
                          }}
                        >
                          View ID
                        </p>
                      </div>
                    </td>
                    <td className="border border-black/10 text-left text-sm font-normal p-3">
                      {request.status === "pending" ? (
                        <div className="inline-flex p-2 rounded-xl bg-yellow-500 text-white text-sm font-normal">
                          Pending
                        </div>
                      ) : request.status === "approved" ? (
                        <div className="inline-flex p-2 rounded-xl bg-green-700 text-white text-sm font-normal">
                          Approved
                        </div>
                      ) : request.status === "declined" ? (
                        <div className="inline-flex p-2 rounded-xl bg-red-700 text-white text-sm font-normal">
                          Declined
                        </div>
                      ) : request.status === "completed" ? (
                        <div className="inline-flex p-2 rounded-xl bg-yellow-500 text-white text-sm font-normal">
                          Completed
                        </div>
                      ) : null}
                    </td>
                    <td className="border border-black/10 text-left text-sm font-normal p-3">
                      {request.status === "pending" ? (
                        <div className="flex flex-wrap items-center justify-start gap-2">
                          <div
                            className="p-3 rounded-xl bg-green-700 text-white cursor-pointer"
                            onClick={() => approveRequest(request._id)}
                          >
                            <p className="text-sm font-normal">Approve</p>
                          </div>
                          <div
                            className="p-3 rounded-xl bg-red-700 text-white cursor-pointer"
                            onClick={() => declineRequest(request._id)}
                          >
                            <p className="text-sm font-normal">Decline</p>
                          </div>
                        </div>
                      ) : request.status === "approved" ? (
                        <div className="flex flex-wrap items-center justify-start gap-2">
                          <div
                            className="p-3 rounded-xl bg-green-700 text-white cursor-pointer"
                            onClick={() => {
                              showCompletionForm(true);
                              setData(request);
                            }}
                          >
                            <p className="text-sm font-normal">Print</p>
                          </div>
                        </div>
                      ) : request.status === "declined" ||
                        request.status === "completed" ? (
                        <div className="flex flex-wrap items-center justify-start gap-2">
                          <div
                            className="p-3 rounded-xl bg-green-700 text-white cursor-pointer"
                            onClick={() => {
                              generateAndPreviewPdf(request);
                            }}
                          >
                            <p className="text-sm font-normal">Print</p>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="">
                  <td
                    className="text-center p-6 text-sm font-normal"
                    colSpan={5}
                  >
                    No Results Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex flex-row items-center justify-center space-x-4 py-6">
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (pageNumber) =>
                  pageNumber === page ||
                  pageNumber === page - 1 ||
                  pageNumber === page + 1
              )
              .map((pageNumber) => (
                <p
                  key={pageNumber}
                  className={`cursor-pointer ${
                    page === pageNumber
                      ? "font-semibold text-sm"
                      : "font-normal text-sm text-[#6E6E6E]"
                  }`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </p>
              ))}
          </div>
        </div>
      </div>

      {approvalForm && (
        <UserApproval
          userId={selectedUser}
          isForFileRequest={true}
          onClose={() => {
            showApprovalForm(false);
          }}
        />
      )}
      {deleteModal && (
        <DeleteModal
          onClose={() => {
            showDeleteModal(false);
          }}
          onDelete={() => deleteRequest(selectedRequest)}
        />
      )}
      {completionForm && (
        <CompletionForm
          data={data}
          onClose={() => {
            showCompletionForm(false);
            getData();
          }}
        />
      )}
      {modal && (
        <Modal
          message={message}
          error={error}
          onClose={() => {
            showModal(false);
            showDeleteModal(false);
            getData();
          }}
        />
      )}
    </>
  );
};

export default FileRequests;

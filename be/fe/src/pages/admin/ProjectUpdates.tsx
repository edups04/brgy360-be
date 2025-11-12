import React, { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import AdminTransparency from "../../components/AdminTransparency";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUpdates } from "../../providers/UpdatesProvider";
import {
  RiCalendarLine,
  RiDeleteBin4Line,
  RiEditLine,
  RiEmotionUnhappyLine,
  RiSearchLine,
} from "react-icons/ri";
import DeleteModal from "../../components/DeleteModal";
import Modal from "../../components/Modal";
import BACKEND_API from "../../utils/API";

const ProjectUpdates = () => {
  const { updates, getUpdates, totalPages } = useUpdates();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [barangayId, setBarangayId] = useState("");

  const [deleteModal, showDeleteModal] = useState(false);
  const [modal, showModal] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (page > totalPages && totalPages !== 0) {
      setPage(page - 1);
    }
  }, [page, totalPages]);

  const deleteUpdates = async (updateId: string) => {
    if (updateId) {
      try {
        let url = `${BACKEND_API}/projects/${updateId}`;
        // let url = `http://localhost:8080/api/projects/${updateId}`;

        let response = await axios.delete(url);

        if (response.data.success === true) {
          setError(false);
          showModal(true);
          setMessage(response.data.message);
          getData();
        }
      } catch (error: any) {
        setError(true);
        showModal(true);
        setMessage(error.response.data.message);
      }
    }
  };

  const getData = async () => {
    const user = localStorage.getItem("user");

    if (user) {
      const currUser = JSON.parse(user);

      if (currUser) {
        try {
          let url = `${BACKEND_API}/users/${currUser._id}`;
          // let url = `http://localhost:8080/api/users/${currUser._id}`;

          let response = await axios.get(url);

          if (response.data.success === true) {
            setBarangayId(response.data.data.barangayId);
            await getUpdates(
              search,
              response.data.data.barangayId,
              page,
              limit
            );
          }
        } catch (error: any) {
          console.log(error.response.data);
        }
      }
    }
  };

  useEffect(() => {
    getData();
  }, [search, page, limit]);

  return (
    <>
      <AdminNavbar />
      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]"></div>
        <div className="w-full flex flex-col items-center justify-center gap-6 px-4 py-6">
          <AdminTransparency />
          {/* header */}
          <div className="w-full flex flex-col items-start justify-center">
            <p className="text-sm font-semibold">Project Updates</p>
            <p className="text-sm font-normal">
              post and manage project updates on your barangay
            </p>
          </div>
          {/* search and add */}
          <div className="w-full flex flex-row items-center justify-between">
            <div className="w-3/4 lg:w-2/4 relative flex items-center justify-center">
              <input
                type="text"
                className="outline-none border border-green-700 text-sm font-normal w-full pl-10 pr-3 py-3 rounded-xl"
                placeholder="search for project updates"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <RiSearchLine
                size={16}
                color="black"
                className="absolute left-4"
              />
            </div>
            <div
              className="flex items-center justify-center cursor-pointer text-sm font-normal text-white bg-green-700 p-3 rounded-xl"
              onClick={() => navigate("/admin/transparency/updates/add")}
            >
              Add New
            </div>
          </div>
          {/* count */}
          <div className="w-full flex items-center justify-start">
            <p className="text-sm font-normal">Count: {updates.length}</p>
          </div>
          {/* data */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
            {updates.length > 0 ? (
              updates.map((update: any) => (
                <div
                  className="w-full flex flex-col items-center justify-center p-6 rounded-xl shadow-xl shadow-black/10"
                  key={update._id}
                >
                  <div className="w-full flex-col flex lg:flex-row items-center justify-between">
                    <div className="w-full lg:w-2/3 flex flex-row items-center justify-start gap-2">
                      <div
                        className="w-[60px] h-[60px] rounded-full bg-gray-200 shrink-0 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            update.image !== "N/A"
                              ? `url(${BACKEND_API}/images/${encodeURIComponent(
                                  update.image
                                )})`
                              : "",
                        }}
                      ></div>
                      <div className="flex flex-col items-start justify-center gap-2">
                        <p className="line-clamp-1 text-sm font-normal cursor-pointer">
                          {update.title}
                        </p>
                        <div className="w-full flex flex-row items-center justify-start gap-1">
                          <RiCalendarLine size={14} color="black" />
                          <p className="text-sm font-normal">
                            {new Date(update.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-row items-center justify-end gap-2">
                      <div
                        className="p-3 rounded-xl bg-green-700 text-white cursor-pointer"
                        onClick={() =>
                          navigate("/admin/transparency/updates/edit", {
                            state: update._id,
                          })
                        }
                      >
                        <RiEditLine size={16} />
                      </div>
                      <div
                        className="p-3 rounded-xl bg-red-700 text-white cursor-pointer"
                        onClick={() => {
                          showDeleteModal(true);
                          setSelectedUpdate(update._id);
                        }}
                      >
                        <RiDeleteBin4Line size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex flex-row items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center justify-center text-green-700 gap-4">
                  <RiEmotionUnhappyLine size={46} />
                  <p className="text-sm font-semibold">No Results Found</p>
                </div>
              </div>
            )}
          </div>
          {/* pagination */}
          <div className="flex flex-row items-center justify-center space-x-4 py-2">
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
                      ? "font-semibold text-sm text-green-700"
                      : "font-normal text-sm text-green-700"
                  }`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </p>
              ))}
          </div>
        </div>
        <div className="w-full h-[10vh] lg:hidden"></div>
      </div>
      {deleteModal && (
        <DeleteModal
          onDelete={() => deleteUpdates(selectedUpdate)}
          onClose={() => showDeleteModal(false)}
        />
      )}
      {modal && (
        <Modal
          message={message}
          error={error}
          onClose={() => {
            showDeleteModal(false);
            showModal(false);
          }}
        />
      )}
    </>
  );
};

export default ProjectUpdates;

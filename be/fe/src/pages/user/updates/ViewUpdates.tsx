import axios from "axios";
import React, { useEffect, useState } from "react";
import { RiArrowLeftSLine, RiCalendarLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavbar from "../../../components/UserNavbar";
import BACKEND_API from "../../../utils/API";
import { useUpdates } from "../../../providers/UpdatesProvider";

const ViewUpdates = () => {
  const { updates, totalPages } = useUpdates();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [page, setPage] = useState(1);
  const limit = 5;

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      if (state) {
        try {
          let url = `${BACKEND_API}/projects/${state}`;
          let response = await axios.get(url);

          if (response.data.success === true) {
            setData(response.data.data);
          }
        } catch (error: any) {
          console.log(error);
        }
      }
    };

    getData();
  }, [state]);

  const getImageUrl = (imgName?: string) => {
    if (!imgName || imgName === "N/A") return "";
    return `${BACKEND_API}/images/${encodeURIComponent(imgName)}`;
  };

  const openLightbox = (update: any) => {
    if (update.image && update.image !== "N/A") {
      setLightboxData(update);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxData(null);
  };

  return (
    <>
      <UserNavbar />
      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]"></div>
        <div className="w-full flex flex-col lg:flex-row items-start justify-center px-4 py-6 gap-6">
          <div className="w-full flex flex-col items-center justify-center px-4 py-6 gap-6">
            {/* header */}
            <div className="w-full flex flex-row items-center justify-start gap-2">
              <RiArrowLeftSLine
                size={24}
                color="black"
                className="cursor-pointer transition duration-300 ease-in-out hover:scale-110 hover:text-green-700"
                onClick={() => navigate("/user/transparency/updates")}
              />
              <p className="text-lg font-semibold text-green-700">
                Project Updates
              </p>
            </div>

            {/* image with lightbox */}
            <div
              className="w-full max-w-[50%] h-[220px] lg:h-[620px] bg-gray-200 rounded-xl bg-cover bg-center cursor-zoom-in 
                         transition duration-300 ease-in-out hover:scale-105"
              onClick={() => openLightbox(data)}
              style={{
                backgroundImage:
                  data.image !== "N/A"
                    ? `url(${getImageUrl(data.image)})`
                    : "",
              }}
            ></div>

            {/* title */}
            <div className="w-full flex flex-col items-start justify-center gap-2 bg-gray-50 p-2 rounded-lg">
              <p className="text-lg font-semibold text-green-700">{data.title}</p>
              <div className="w-full flex flex-row items-center justify-start gap-2 text-green-700">
                <RiCalendarLine size={16} />
                <p className="text-sm font-normal">
                  {new Date(data.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="w-full flex items-center justify-start bg-gray-50 p-2 rounded-lg">
              <pre className="text-lg font-normal whitespace-pre-wrap break-words font-sans">
                {data.contents}
              </pre>
            </div>
          </div>

          {/* MORE UPDATES */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center gap-4">
            <div className="w-full flex items-center justify-start bg-green-700 p-3 text-lg font-normal text-white rounded-xl">
              More Updates
            </div>

            {updates.length > 0 &&
              updates.map((update: any) => {
                const isActive = data._id === update._id;
                return (
                  <div
                    key={update._id}
                    className={`w-full flex flex-col items-start justify-center p-3 gap-2 cursor-pointer border-b border-black/5 rounded-xl transition duration-300 ease-in-out ${
                      isActive
                        ? "bg-green-700/60"
                        : "hover:bg-green-50 hover:scale-[1.02]"
                    }`}
                    onClick={() => openLightbox(update)}
                  >
                    <p
                      className={`text-lg font-semibold line-clamp-1 ${
                        isActive ? "text-white" : "text-green-700"
                      }`}
                    >
                      {update.title}
                    </p>
                    <div
                      className={`w-full flex flex-row items-center justify-start gap-1 ${
                        isActive ? "text-white" : "text-green-700"
                      }`}
                    >
                      <RiCalendarLine size={16} />
                      <p className="text-sm font-normal ">
                        {new Date(update.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}

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
                    className={`cursor-pointer transition duration-300 ease-in-out hover:scale-110 ${
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
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen &&
        lightboxData &&
        lightboxData.image &&
        lightboxData.image !== "N/A" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full transition duration-300 ease-in-out hover:bg-red-600 hover:scale-110"
            >
              ✕
            </button>

            <img
              src={getImageUrl(lightboxData.image)}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-lg"
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center max-w-[90%]">
              <p className="font-semibold text-lg drop-shadow-lg">
                {lightboxData.title}
              </p>
            </div>
          </div>
        )}
    </>
  );
};

export default ViewUpdates;

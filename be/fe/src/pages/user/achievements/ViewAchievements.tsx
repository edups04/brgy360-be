import React, { useEffect, useState } from "react";
import { RiArrowLeftSLine, RiCalendarLine } from "react-icons/ri";
import UserNavbar from "../../../components/UserNavbar";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import BACKEND_API from "../../../utils/API";
import { useAchievements } from "../../../providers/AchievementsProvider";

const ViewAchievements = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const { achievements, totalPages } = useAchievements();
  const [page, setPage] = useState(1);
  const limit = 5;

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const getData = async () => {
      if (state) {
        try {
          const url = `${BACKEND_API}/accomplishments-achievements/${state}`;
          const response = await axios.get(url);

          if (response.data.success === true) {
            setData(response.data.data);
          }
        } catch (error: any) {
          console.log(error);
        }
      }
    };

    getData();
  }, []);

  const getImageUrl = (imgName?: string) => {
    if (!imgName || imgName === "N/A") return "";
    return `${BACKEND_API}/images/${encodeURIComponent(imgName)}`;
  };

  const openLightbox = () => {
    if (data.image && data.image !== "N/A") {
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => setLightboxOpen(false);

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
                className="cursor-pointer"
                onClick={() =>
                  navigate("/user/transparency/achievements")
                }
              />
              <p className="text-lg font-semibold text-green-700">
                Accomplishments and Achievements
              </p>
            </div>

            {/* image */}
            <div
              role="button"
              tabIndex={0}
              onClick={openLightbox}
              className="w-full max-w-[50%] h-[220px] lg:h-[620px] bg-gray-200 rounded-xl bg-cover bg-center cursor-zoom-in"
              style={{
                backgroundImage:
                  data.image !== "N/A"
                    ? `url(${getImageUrl(data.image)})`
                    : "",
              }}
            ></div>

            {/* title */}
            <div className="w-full flex flex-col items-start justify-center gap-2 bg-gray-50 p-2 rounded-lg">
              <p className="text-lg font-semibold text-green-700">
                {data.title}
              </p>
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

          {/* More Achievements */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center gap-4">
            <div className="w-full flex items-center justify-start bg-green-700 p-3 text-lg font-normal text-white rounded-xl">
              More Accomplishments
            </div>

            {achievements.length > 0 &&
              achievements.map((achievement: any) => (
                <div
                  className={`w-full flex flex-col items-start justify-center p-3 gap-2 cursor-pointer border-b border-black/5 rounded-xl ${
                    data._id === achievement._id ? "bg-green-700/60" : ""
                  }`}
                  onClick={() => setData(achievement)}
                  key={achievement._id}
                >
                  <p
                    className={`text-lg font-semibold line-clamp-1 ${
                      data._id === achievement._id
                        ? "text-white"
                        : "text-green-700"
                    }`}
                  >
                    {achievement.title}
                  </p>
                  <div
                    className={`w-full flex flex-row items-center justify-start gap-1 ${
                      data._id === achievement._id
                        ? "text-white"
                        : "text-green-700"
                    }`}
                  >
                    <RiCalendarLine size={16} />
                    <p className="text-sm font-normal">
                      {new Date(achievement.date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              ))}

            {/* Pagination */}
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
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && data.image && data.image !== "N/A" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full"
          >
            ✕
          </button>

          <img
            src={getImageUrl(data.image)}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-lg"
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center max-w-[90%]">
            <p className="font-semibold text-lg drop-shadow-lg">{data.title}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewAchievements;

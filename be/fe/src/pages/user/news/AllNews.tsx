
import React, { useEffect, useState, useCallback } from "react";
import UserNavbar from "../../../components/UserNavbar";
import { useNews } from "../../../providers/NewsProvider";
import { RiArrowLeftSLine, RiCalendarLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import BACKEND_API from "../../../utils/API";

const AllNews: React.FC = () => {
  const { state } = useLocation();
  const {
    latestNews,
    getLatestNews,
    news,
    getNews,
    totalPages,
    setLatestNews,
  } = useNews();
  const limit = 5;
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");

  const combinedList = [...(latestNews || []), ...(news || [])];

  useEffect(() => {
    const getData = async () => {
      const user = localStorage.getItem("user");

      if (user) {
        const currUser = JSON.parse(user);

        if (currUser) {
          await getNews("", currUser.barangayId, page, limit);

          if (!state) {
            await getLatestNews(currUser.barangayId);
          } else {
            setLatestNews([state]);
          }
        }
      }
    };

    getData();
  }, [page]);

  const getImageUrl = (imgName?: string) => {
    if (!imgName || imgName === "N/A") return "";
    return `${BACKEND_API}/images/${encodeURIComponent(imgName)}`;
  };

  const openLightbox = (image?: string, title?: string) => {
    if (!image || image === "N/A") return;
    setLightboxImage(getImageUrl(image));
    setLightboxTitle(title || "");
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
    },
    [lightboxOpen]
  );

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handleKeyDown]);

  return (
    <>
      <UserNavbar />

      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]" />
        <div className="w-full flex flex-col lg:flex-row items-start justify-center px-4 py-6 gap-6">
          <div className="w-full lg:w-3/4 flex flex-col items-center justify-center gap-6">
            {/* Header */}
            <div className="w-full flex flex-row gap-2 items-center justify-start">
              <RiArrowLeftSLine
                size={24}
                color="black"
                className="cursor-pointer transition duration-300 ease-in-out hover:scale-110 hover:text-green-700"
                onClick={() => navigate("/user/news")}
              />
              <p className="text-lg font-semibold text-green-700">
                News and Announcements
              </p>
            </div>

            {/* Latest News */}
            {latestNews &&
              latestNews.map((selectedNews) => {
                return (
                  <div
                    key={selectedNews._id}
                    className="w-full flex flex-col items-center justify-center gap-6"
                  >
                    {/* Image — opens lightbox */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        openLightbox(selectedNews.image, selectedNews.title)
                      }
                      className="w-full max-w-[75%] h-[220px] lg:h-[620px] bg-gray-200 rounded-xl bg-cover bg-center cursor-zoom-in 
                                 transition duration-300 ease-in-out hover:scale-105"
                      style={{
                        backgroundImage:
                          selectedNews.image && selectedNews.image !== "N/A"
                            ? `url(${getImageUrl(selectedNews.image)})`
                            : "",
                      }}
                    />

                    {/* Content */}
                    <div className="w-full flex flex-col items-start justify-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <p className="text-lg font-semibold text-green-700">
                        {selectedNews.title}
                      </p>
                      <pre className="text-lg whitespace-pre-wrap break-words font-sans">
                        {selectedNews.contents}
                      </pre>
                    </div>
                  </div>
                );
              })}
          </div>

        {/* Right Sidebar — More News */}
        <div className="w-full lg:w-1/4 flex flex-col items-center justify-center gap-4">
          <div className="w-full flex items-center justify-start bg-green-700 p-3 text-sm font-normal text-white rounded-xl">
            More News
          </div>

          {news.length > 0 &&
            news.map((n) => {
              const isActive = latestNews[0]?._id === n._id;
              return (
                <div
                  key={n._id}
                  className={`w-full flex flex-col items-start justify-center p-3 gap-2 cursor-pointer border-b border-black/5 rounded-xl transition duration-300 ease-in-out ${
                    isActive ? "bg-green-700/60" : "hover:bg-green-50 hover:scale-[1.02]"
                  }`}
                  onClick={() => {
                    setLatestNews([n]);
                  }}
                >
                  <p
                    className={`text-lg font-semibold line-clamp-1 ${
                      isActive ? "text-white" : "text-green-700"
                    }`}
                  >
                    {n.title}
                  </p>
                  <div
                    className={`w-full flex flex-row items-center justify-start gap-1 ${
                      isActive ? "text-white" : "text-green-700"
                    }`}
                  >
                    <RiCalendarLine size={16} />
                    <p className="text-sm">
                      {new Date(n.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}

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

        <div className="w-full h-[10vh] lg:hidden" />
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full 
                       transition duration-300 ease-in-out hover:bg-red-600 hover:scale-110"
          >
            ✕
          </button>

          <img
            src={lightboxImage}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-lg"
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-center max-w-[90%]">
            <p className="font-semibold text-lg drop-shadow-lg">{lightboxTitle}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AllNews;

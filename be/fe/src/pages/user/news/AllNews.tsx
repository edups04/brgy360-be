import React, { useEffect, useState } from "react";
import UserNavbar from "../../../components/UserNavbar";
import { useNews } from "../../../providers/NewsProvider";
import { RiArrowLeftSLine, RiCalendarLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import BACKEND_API from "../../../utils/API";

const AllNews = () => {
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

  return (
    <>
      <UserNavbar />
      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]"></div>
        <div className="w-full flex flex-col lg:flex-row items-start justify-center px-4 py-6 gap-6">
          <div className="w-full lg:w-3/4 flex flex-col items-center justify-center gap-6">
            {/* header */}
            <div className="w-full flex flex-row gap-2 items-center justify-start">
              <RiArrowLeftSLine
                size={24}
                color="black"
                className="cursor-pointer"
                onClick={() => navigate("/user/news")}
              />
              <p className="text-lg font-semibold text-green-700">
                News and Announcements
              </p>
            </div>
            {latestNews
              ? latestNews.map((selectedNews) => {
                  return (
                    <>
                      <div
                        className="w-full flex flex-col items-center justify-center gap-6"
                        key={selectedNews._id}
                      >
                        {/* image */}
                        <div
                          className="w-full max-w-[75%] h-[220px] lg:h-[620px] bg-gray-200 rounded-xl bg-cover bg-center"
                          style={{
                            backgroundImage:
                              selectedNews.image !== "N/A"
                                ? `url(${BACKEND_API}/images/${encodeURIComponent(
                                    selectedNews.image
                                  )})`
                                : "",
                          }}
                        ></div>
                        {/* content */}
                        <div className="w-full flex flex-col items-start justify-center gap-2 bg-gray-50 p-2 rounded-lg">
                          <p className="text-lg font-semibold text-green-700">
                            {selectedNews.title}
                          </p>
                          <pre className="text-lg font-normal whitespace-pre-wrap break-words font-sans">
                            {selectedNews.contents}
                          </pre>
                        </div>
                      </div>
                    </>
                  );
                })
              : null}
          </div>
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center gap-4">
            {/* header */}
            <div className="w-full flex items-center justify-start bg-green-700 p-3 text-sm font-normal text-white rounded-xl">
              More News
            </div>
            {/* news */}
            {news.length > 0
              ? news.map((news: any) => (
                  <div
                    className={`w-full flex flex-col items-start justify-center p-3 gap-2 cursor-pointer border-b border-black/5 rounded-xl ${
                      latestNews[0]?._id === news._id ? "bg-green-700/60" : ""
                    }`}
                    onClick={() => {
                      setLatestNews([news]);
                      // navigate("/user/news/all", { state: news._id })
                    }}
                    key={news._id}
                  >
                    <p
                      className={`text-lg font-semibold line-clamp-1 ${
                        latestNews[0]?._id === news._id
                          ? "text-white"
                          : "text-green-700"
                      } `}
                    >
                      {news.title}
                    </p>
                    <div
                      className={`w-full flex flex-row items-center justify-start ${
                        latestNews[0]?._id === news._id
                          ? "text-white"
                          : "text-green-700"
                      } gap-1`}
                    >
                      <RiCalendarLine size={16} />
                      <p className="text-sm font-normal ">
                        {new Date(news.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              : null}
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
        </div>
        <div className="w-full h-[10vh] lg:hidden"></div>
      </div>
    </>
  );
};

export default AllNews;

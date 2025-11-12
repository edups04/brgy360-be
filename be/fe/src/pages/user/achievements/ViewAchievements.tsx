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

  useEffect(() => {
    const getData = async () => {
      if (state) {
        try {
          let url = `${BACKEND_API}/accomplishments-achievements/${state}`;
          // let url = `http://localhost:8080/api/accomplishments-achievements/${state}`;

          let response = await axios.get(url);

          if (response.data.success === true) {
            setData(response.data.data);
            console.log(response.data.data.image);
          }
        } catch (error: any) {
          console.log(error);
        }
      }
    };

    getData();
  }, []);

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
                onClick={() => navigate("/user/transparency/achievements")}
              />
              <p className="text-lg font-semibold text-green-700">
                Accomplishments and Achievements
              </p>
            </div>
            {/* image */}
            <div
              className="w-full max-w-[50%] h-[220px] lg:h-[620px] bg-gray-200 rounded-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  data.image !== "N/A"
                    ? `url(${BACKEND_API}/images/${encodeURIComponent(
                        data.image
                      )})`
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
          {/* * MORE ACHIEVEMENTS */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center gap-4">
            {/* header */}
            <div className="w-full flex items-center justify-start bg-green-700 p-3 text-lg font-normal text-white rounded-xl">
              More Accomplishments
            </div>
            {/* news */}
            {achievements.length > 0
              ? achievements.map((achievement: any) => (
                  <div
                    className={`w-full flex flex-col items-start justify-center p-3 gap-2 cursor-pointer border-b border-black/5 rounded-xl ${
                      data._id === achievement._id ? "bg-green-700/60" : ""
                    }`}
                    onClick={
                      () => setData(achievement)
                      // navigate("/user/transparency/achievements/view", {
                      //   state: achievement._id,
                      // })
                    }
                    key={achievement._id}
                  >
                    <p
                      className={`text-lg font-semibold line-clamp-1 text-green-700 ${
                        data._id === achievement._id
                          ? "text-white"
                          : "text-green-700"
                      }`}
                    >
                      {achievement.title}
                    </p>
                    <div
                      className={`w-full flex flex-row items-center justify-start text-green-700 gap-1 ${
                        data._id === achievement._id
                          ? "text-white"
                          : "text-green-700"
                      }`}
                    >
                      <RiCalendarLine size={16} />
                      <p className="text-sm font-normal ">
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
      </div>
    </>
  );
};

export default ViewAchievements;

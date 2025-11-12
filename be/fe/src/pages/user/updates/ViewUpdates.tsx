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

  useEffect(() => {
    const getData = async () => {
      if (state) {
        try {
          let url = `${BACKEND_API}/projects/${state}`;
          // let url = `http://localhost:8080/api/projects/${state}`;

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
                onClick={() => navigate("/user/transparency/updates")}
              />
              <p className="text-lg font-semibold text-green-700">
                Project Updates
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
          {/* MORE NEWS */}
          <div className="w-full lg:w-1/4 flex flex-col items-center justify-center gap-4">
            {/* header */}
            <div className="w-full flex items-center justify-start bg-green-700 p-3 text-lg font-normal text-white rounded-xl">
              More Updates
            </div>
            {/* news */}
            {updates.length > 0
              ? updates.map((update: any) => (
                  <div
                    className={`w-full flex flex-col items-start justify-center p-3 gap-2 cursor-pointer border-b border-black/5 rounded-xl ${
                      data._id === update._id ? "bg-green-700/60" : ""
                    }`}
                    onClick={
                      () => setData(update)
                      // navigate("/user/transparency/updates/view", {
                      //   state: update._id,
                      // })
                    }
                    key={update._id}
                  >
                    <p
                      className={`text-lg font-semibold line-clamp-1 ${
                        data._id === update._id
                          ? "text-white"
                          : "text-green-700"
                      }`}
                    >
                      {update.title}
                    </p>
                    <div
                      className={`w-full flex flex-row items-center justify-start ${
                        data._id === update._id
                          ? "text-white"
                          : "text-green-700"
                      } gap-1`}
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

export default ViewUpdates;

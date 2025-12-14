import React, { useEffect } from "react";
import UserNavbar from "../../components/UserNavbar";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const baseUrl = `${window.location.protocol}//${window.location.host}/`;
    let CURRENT_USER = JSON.parse(localStorage.getItem("user"));

    // @ts-ignore
    window.chtlConfig = {
      chatbotId: "6382343746",
      variables: {
        userId: CURRENT_USER._id || "",
        baseUrl: baseUrl,
      },
    };

    const script = document.createElement("script");
    script.src = "https://chatling.ai/js/embed.js";
    script.async = true;
    script.id = "chtl-script";
    script.setAttribute("data-id", "6382343746");

    document.body.appendChild(script);

    return () => {
      document.getElementById("chtl-script")?.remove();
    };
  }, []);

  return (
    <>
      <UserNavbar />
      <div className="flex flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]"></div>
        <div className="w-full min-h-screen flex items-center justify-center px-4 py-6">
          <div className="w-4/5 lg:w-2/4 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold uppercase text-green-700 text-center">
              Welcome to Barangay 360
            </p>
            <p className="text-md font-normal text-center">
              Your one-stop platform for hassle-free barangay services. Stay
              updated with news and announcements, request documents and access
              transparency reports all in one place
            </p>
            <div
              className="p-3 rounded-xl bg-green-700 text-sm font-normal text-white mt-4 cursor-pointer 
                         transition duration-300 ease-in-out hover:bg-green-800 hover:scale-105"
              onClick={() => navigate("/user/news")}
            >
              View More
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

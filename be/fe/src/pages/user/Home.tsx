import React, { useEffect } from "react";
import UserNavbar from "../../components/UserNavbar";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set the chatbot config
    const baseUrl = `${window.location.protocol}//${window.location.host}/`;
    // alert(baseUrl);

    let CURRENT_USER = JSON.parse(localStorage.getItem("user"));

    // @ts-ignore
    window.chtlConfig = {
      // chatbotId: "6153291475", // prev bot
      chatbotId: "6382343746", // new
      variables: {
        userId: CURRENT_USER._id || "",
        baseUrl: baseUrl,
      },
    };

    // Create and append the script
    const script = document.createElement("script");
    script.src = "https://chatling.ai/js/embed.js";
    // script.src = "http://localhost:8080/api/users/proxy/chatbot";
    script.async = true;
    script.id = "chtl-script";
    // script.setAttribute("data-id", "6153291475"); // prev bot
    script.setAttribute("data-id", "6382343746"); // new

    document.body.appendChild(script);

    // Optional cleanup if the component unmounts
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
              className="p-3 rounded-xl bg-green-700 text-sm font-normal text-white mt-4 cursor-pointer"
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

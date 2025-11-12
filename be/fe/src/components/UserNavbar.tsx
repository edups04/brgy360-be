import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  RiArrowDropLeftLine,
  RiArrowDropRightLine,
  RiChat4Fill,
  RiChat4Line,
  RiDashboardFill,
  RiDashboardLine,
  RiFilePdf2Fill,
  RiFilePdf2Line,
  RiFundsBoxFill,
  RiFundsBoxLine,
  RiGroupFill,
  RiGroupLine,
  RiHome6Fill,
  RiHome6Line,
  RiLogoutBoxRLine,
  RiNewsFill,
  RiNewsLine,
  RiUser4Fill,
  RiUser4Line,
} from "react-icons/ri";
import LogoCollapsed from "../assets/Logo.png";
import LogoExpanded from "../assets/LogoFull.png";
import Chatbot from "../pages/user/Chatbot";
import WEBSOCKET_URL from "../utils/Realtime";
import axios from "axios";
import BACKEND_API from "../utils/API";
import { useChats } from "../providers/ChatsProvider";

const UserNavbar = () => {
  const [expand, setExpand] = useState(false);
  const { onLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [chatBot, showChatBot] = useState(false);

  // * REAL TIME UPDATES
  const { unreadMessageCount, setUnreadMessageCount, getUserChats } =
    useChats();
  const chatBotRef = useRef(chatBot);

  const realTime = async () => {
    // * Create a new WebSocket connection
    const socket = new WebSocket(WEBSOCKET_URL); // * Update with your WebSocket URL

    //  *Event listener for when the connection is opened
    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
      socket.send(JSON.stringify({ message: "Hello from client!" }));
    });

    // * Event listener for incoming messages
    socket.addEventListener("message", async (event) => {
      const receivedData = JSON.parse(event.data); // * Parse the incoming JSON data
      // console.log("New data received:", receivedData);

      // * to differentiate real-time updates
      switch (receivedData.realTimeType) {
        case "ws connection":
          break;
          case "chat":
          console.log(receivedData.data);
          let user = JSON.parse(localStorage.getItem("user"));
          console.log("FOR USER: ", receivedData.data.userId);
          console.log("FROM USER: ", user._id);
          if (
            user &&
            receivedData.data.from === "chatbot" &&
            receivedData.data.userId === user._id
          ) {
            await getUserChats(user._id);
            if (!chatBotRef.current) {
              setUnreadMessageCount((prevCount) => prevCount + 1);
            }
          }
          break;
      }
    });

    // * Event listener for errors
    socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });

    // * Event listener for when the connection is closed
    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });

    // * Clean up the WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  };

  useEffect(() => {
    realTime();
  }, []);

  useEffect(() => {
    chatBotRef.current = chatBot;
  }, [chatBot]);
  // * END OF REAL TIME UPDATES

  useEffect(() => {
    if (location.pathname.includes("/user/home")) {
      setActiveRoute("home");
      document.title = "Home";
    } else if (location.pathname.includes("/user/profile")) {
      setActiveRoute("profile");
      document.title = "Profile";
    } else if (location.pathname.includes("/user/request")) {
      setActiveRoute("request");
      document.title = "File Request";
    } else if (location.pathname.includes("/user/news")) {
      setActiveRoute("news");
      document.title = "News and Announcements";
    } else if (location.pathname.includes("/user/transparency")) {
      setActiveRoute("transparency");
      document.title = "Transparency Dashboard";
    } else if (location.pathname.includes("/user/chatbot")) {
      setActiveRoute("chatbot");
      document.title = "Chat Bot";
    }
  }, [location.pathname]);

  return (
    <>
      <div className="w-full lg:w-auto lg:h-full fixed bottom-0 lg:top-0 left-0 flex flex-col items-center justify-center text-white p-2 z-20">
        <div className="relative w-auto lg:h-full flex flex-row lg:flex-col items-center justify-center gap-4 lg:justify-between p-4 lg:p-6 rounded-2xl bg-green-700">
          <div className="flex flex-row lg:flex-col items-center justify-center gap-4 lg:gap-6">
            <div className="hidden w-full lg:flex items-center justify-start">
            <img
              src={expand ? LogoExpanded : LogoCollapsed}
              alt="Logo"
              className={`cursor-pointer transition-all duration-300 ${
                expand ? "h-[40px] w-auto" : "h-[40px] w-auto"
              } hover:brightness-110`}
              style={{
                filter: "drop-shadow(0 0 6px rgba(0,0,0,0.6))",
              }}
              onClick={() => navigate("/user/home")}
            />
            </div>
            <div
              className="w-full flex lg:hidden flex-row items-center justify-start gap-2 cursor-pointer"
              onClick={() => navigate("/user/home")}
            >
              {activeRoute === "home" ? (
                <RiHome6Fill
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              ) : (
                <RiHome6Line
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              )}
              {expand ? <p className="text-sm font-normal">Profile</p> : null}
            </div>

            <div
              className="w-full flex flex-row items-center justify-start gap-2 cursor-pointer"
              onClick={() => navigate("/user/profile")}
            >
              {activeRoute === "profile" ? (
                <RiUser4Fill
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              ) : (
                <RiUser4Line
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              )}
              {expand ? <p className="text-sm font-normal">Profile</p> : null}
            </div>

            <div
              className="w-full flex flex-row items-center justify-start gap-2 cursor-pointer"
              onClick={() => navigate("/user/request")}
            >
              {activeRoute === "request" ? (
                <RiFilePdf2Fill
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              ) : (
                <RiFilePdf2Line
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              )}
              {expand ? (
                <p className="text-sm font-normal">File Requests</p>
              ) : null}
            </div>

            <div
              className="w-full flex flex-row items-center justify-start gap-2 cursor-pointer"
              onClick={() => navigate("/user/news")}
            >
              {activeRoute === "news" ? (
                <RiNewsFill
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              ) : (
                <RiNewsLine
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              )}
              {expand ? (
                <p className="text-sm font-normal">News & Announcements</p>
              ) : null}
            </div>

            <div
              className="w-full flex flex-row items-center justify-start gap-2 cursor-pointer"
              onClick={() => navigate("/user/transparency")}
            >
              {activeRoute === "transparency" ? (
                <RiFundsBoxFill
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              ) : (
                <RiFundsBoxLine
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              )}
              {expand ? (
                <p className="text-sm font-normal">Transparency Dashboard</p>
              ) : null}
            </div>
          </div>

          <div className="w-auto lg:w-full flex flex-row lg:flex-col items-center justify-center gap-4 lg:gap-6 relative">
            {unreadMessageCount > 0 && (
              <div className="absolute top-[-1.5rem] left-1 rounded-full px-2 py-1 min-w-8 text-center bg-red-500">
                <span className="font-bold text-sm">
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </span>
              </div>
            )}
            <div className="w-full flex flex-row items-center justify-start gap-2 cursor-pointer">
              {activeRoute === "chatbot" ? (
                <RiChat4Fill
                  size={22}
                  color="white"
                  className="cursor-pointer"
                />
              ) : (
                <RiChat4Line
                  size={22}
                  color="white"
                  className="cursor-pointer"
                  onClick={() => showChatBot(true)}
                />
              )}
              {expand ? <p className="text-sm font-normal">Chat</p> : null}
            </div>

            <div
              className="w-full flex flex-row items-center justify-start gap-2 cursor-pointer"
              onClick={onLogout}
            >
              <RiLogoutBoxRLine
                size={22}
                color="white"
                className="cursor-pointer"
              />
              {expand ? <p className="text-sm font-normal">Logout</p> : null}
            </div>
          </div>
        </div>

        <div
          className="hidden lg:block absolute right-[-4%] p-1 rounded-full bg-white shadow-xl shadow-black/20 cursor-pointer"
          onClick={() => setExpand(!expand)}
        >
          {expand ? (
            <RiArrowDropLeftLine size={24} color="black" />
          ) : (
            <RiArrowDropRightLine size={24} color="black" />
          )}
        </div>
      </div>
      {chatBot && <Chatbot onClose={() => showChatBot(false)} />}
    </>
  );
};

export default UserNavbar;

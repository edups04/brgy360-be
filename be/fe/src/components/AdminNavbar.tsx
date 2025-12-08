import React, { useEffect, useState } from "react";
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
  RiLogoutBoxRLine,
  RiNewsFill,
  RiNewsLine,
  RiUser4Fill,
  RiUser4Line,
} from "react-icons/ri";
import LogoCollapsed from "../assets/Logo.png";
import LogoExpanded from "../assets/LogoFull.png";
import { useAuth } from "../providers/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { useChats } from "../providers/ChatsProvider";
import WEBSOCKET_URL from "../utils/Realtime";

const AdminNavbar = () => {
  const [expand, setExpand] = useState(false);
  const { onLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState("dashboard");

  // REAL TIME
  const { allUnreadMessageCountAdmin, getAdminChats } = useChats();

  const realTime = async () => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
      socket.send(JSON.stringify({ message: "Hello from client!" }));
    });

    socket.addEventListener("message", async (event) => {
      const receivedData = JSON.parse(event.data);

      switch (receivedData.realTimeType) {
        case "ws connection":
          break;
        case "chat":
          let user = localStorage.getItem("user");
          if (user) {
            await getAdminChats(JSON.parse(user).barangayId);
          }
          break;
      }
    });

    socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
    });

    return () => {
      socket.close();
    };
  };

  useEffect(() => {
    realTime();
  }, []);

  useEffect(() => {
    if (location.pathname.includes("/admin/dashboard")) {
      setActiveRoute("dashboard");
      document.title = "Dashboard";
    } else if (location.pathname.includes("/admin/profile")) {
      setActiveRoute("profile");
      document.title = "Profile";
    } else if (location.pathname.includes("/admin/requests")) {
      setActiveRoute("requests");
      document.title = "File Requests";
    } else if (location.pathname.includes("/admin/news")) {
      setActiveRoute("news");
      document.title = "News and Announcements";
    } else if (location.pathname.includes("/admin/transparency")) {
      setActiveRoute("transparency");
      document.title = "Transparency Dashboard";
    } else if (location.pathname.includes("/admin/users")) {
      setActiveRoute("users");
      document.title = "Users";
    } else if (location.pathname.includes("/admin/chatbot")) {
      setActiveRoute("chatbot");
      document.title = "Chat Bot";
    }
  }, [location.pathname]);

  // Hover effect classes (consistent with UserNavbar)
  const navItemClasses =
    "w-full flex flex-row items-center justify-start gap-2 cursor-pointer " +
    "rounded-xl py-2 transition-all duration-200 " +
    "hover:scale-105 hover:bg-green-800 hover:text-white/100 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

  const iconHoverClasses = "transition-colors duration-200";

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
                style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.6))" }}
                onClick={() => navigate("/admin/dashboard")}
              />
            </div>

            <div
              className={navItemClasses}
              onClick={() => navigate("/admin/dashboard")}
            >
              {activeRoute === "dashboard" ? (
                <RiDashboardFill size={22} color="white" className={iconHoverClasses} />
              ) : (
                <RiDashboardLine size={22} color="white" className={iconHoverClasses} />
              )}
              {expand ? <p className="text-sm font-normal">Dashboard</p> : null}
            </div>

            <div
              className={navItemClasses}
              onClick={() => navigate("/admin/profile")}
            >
              {activeRoute === "profile" ? (
                <RiUser4Fill size={22} color="white" className={iconHoverClasses} />
              ) : (
                <RiUser4Line size={22} color="white" className={iconHoverClasses} />
              )}
              {expand ? <p className="text-sm font-normal">Profile</p> : null}
            </div>

            <div
              className={navItemClasses}
              onClick={() => navigate("/admin/requests")}
            >
              {activeRoute === "requests" ? (
                <RiFilePdf2Fill size={22} color="white" className={iconHoverClasses} />
              ) : (
                <RiFilePdf2Line size={22} color="white" className={iconHoverClasses} />
              )}
              {expand ? <p className="text-sm font-normal">File Requests</p> : null}
            </div>

            <div
              className={navItemClasses}
              onClick={() => navigate("/admin/news")}
            >
              {activeRoute === "news" ? (
                <RiNewsFill size={22} color="white" className={iconHoverClasses} />
              ) : (
                <RiNewsLine size={22} color="white" className={iconHoverClasses} />
              )}
              {expand ? (
                <p className="text-sm font-normal">News & Announcements</p>
              ) : null}
            </div>

            <div
              className={navItemClasses}
              onClick={() => navigate("/admin/transparency")}
            >
              {activeRoute === "transparency" ? (
                <RiFundsBoxFill size={22} color="white" className={iconHoverClasses} />
              ) : (
                <RiFundsBoxLine size={22} color="white" className={iconHoverClasses} />
              )}
              {expand ? (
                <p className="text-sm font-normal">Transparency Dashboard</p>
              ) : null}
            </div>

            <div
              className={navItemClasses}
              onClick={() => navigate("/admin/users")}
            >
              {activeRoute === "users" ? (
                <RiGroupFill size={22} color="white" className={iconHoverClasses} />
              ) : (
                <RiGroupLine size={22} color="white" className={iconHoverClasses} />
              )}
              {expand ? <p className="text-sm font-normal">User Management</p> : null}
            </div>
          </div>

          <div className="w-auto lg:w-full flex flex-row lg:flex-col items-center justify-center gap-4 lg:gap-6 relative">
            {allUnreadMessageCountAdmin > 0 && (
              <div className="absolute top-[-1.5rem] left-1 rounded-full px-2 py-1 min-w-8 text-center bg-red-500">
                <span className="font-bold text-sm">
                  {allUnreadMessageCountAdmin > 99 ? "99+" : allUnreadMessageCountAdmin}
                </span>
              </div>
            )}

            <div
              className={navItemClasses}
              onClick={() => navigate("/admin/chatbot")}
            >
              {activeRoute === "chatbot" ? (
                <RiChat4Fill size={22} color="white" className={iconHoverClasses} />
              ) : (
                <RiChat4Line size={22} color="white" className={iconHoverClasses} />
              )}
              {expand ? <p className="text-sm font-normal">Chat</p> : null}
            </div>

            <div className={navItemClasses} onClick={onLogout}>
              <RiLogoutBoxRLine size={22} color="white" className={iconHoverClasses} />
              {expand ? <p className="text-sm font-normal">Logout</p> : null}
            </div>
          </div>
        </div>

        <div
          className="hidden lg:block absolute right-[-4%] p-1 rounded-full bg-white shadow-xl shadow-black/20 cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => setExpand(!expand)}
        >
          {expand ? (
            <RiArrowDropLeftLine size={24} color="black" />
          ) : (
            <RiArrowDropRightLine size={24} color="black" />
          )}
        </div>
      </div>
    </>
  );
};

export default AdminNavbar;

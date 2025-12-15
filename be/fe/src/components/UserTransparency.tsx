import React, { useEffect, useState } from "react";
import {
  RiFolderChartLine,
  RiFundsBoxLine,
  RiMedalLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

const UserTransparency = () => {
  const [activeTab, setActiveTab] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes("/user/transparency/budgets")) {
      setActiveTab("budgets");
      document.title = "Budget Overview";
    } else if (location.pathname.includes("/user/transparency/updates")) {
      setActiveTab("updates");
      document.title = "Project Updates";
    } else if (location.pathname.includes("/user/transparency/achievements")) {
      setActiveTab("achievements");
      document.title = "Accomplishment and Achievements";
    } else if (location.pathname.includes("/user/transparency")) {
      setActiveTab("transparency");
      document.title = "Transparency Dashboard";
    }
  }, [location.pathname]);

  // Shared classes
  const activeClasses =
    "flex flex-row gap-2 p-3 rounded-xl bg-green-700 text-white cursor-pointer transition duration-300 ease-in-out";
  const inactiveClasses =
    "flex flex-row gap-2 p-3 rounded-xl bg-gray-200 cursor-pointer transition duration-300 ease-in-out hover:bg-gray-300 hover:scale-105";

  return (
    <div className="w-full sticky top-0 flex items-center justify-start gap-4">
      {/* Transparency Dashboard */}
      <div
        className={activeTab === "transparency" ? activeClasses : inactiveClasses}
        onClick={() => navigate("/user/transparency")}
      >
        <RiFundsBoxLine size={16} />
        <p className="hidden lg:block text-sm font-normal">
          Transparency Dashboard
        </p>
      </div>

      {/* Budgets */}
      <div
        className={activeTab === "budgets" ? activeClasses : inactiveClasses}
        onClick={() => navigate("/user/transparency/budgets")}
      >
        <RiMoneyDollarCircleLine size={16} />
        <p className="hidden lg:block text-sm font-normal">Budget Overview</p>
      </div>

      {/* Updates */}
      <div
        className={activeTab === "updates" ? activeClasses : inactiveClasses}
        onClick={() => navigate("/user/transparency/updates")}
      >
        <RiFolderChartLine size={16} />
        <p className="hidden lg:block text-sm font-normal">Project Updates</p>
      </div>

      {/* Achievements */}
      <div
        className={activeTab === "achievements" ? activeClasses : inactiveClasses}
        onClick={() => navigate("/user/transparency/achievements")}
      >
        <RiMedalLine size={16} />
        <p className="hidden lg:block text-sm font-normal">Achievements</p>
      </div>
    </div>
  );
};

export default UserTransparency;

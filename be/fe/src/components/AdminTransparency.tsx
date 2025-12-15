import React, { useEffect, useState } from "react";
import {
  RiFolderChartLine,
  RiFundsBoxLine,
  RiMedalLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

const AdminTransparency = () => {
  const [activeTab, setActiveTab] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes("/admin/transparency/budgets")) {
      setActiveTab("budgets");
      document.title = "Budgets Overview";
    } else if (location.pathname.includes("/admin/transparency/updates")) {
      setActiveTab("updates");
      document.title = "Project Updates";
    } else if (location.pathname.includes("/admin/transparency/achievements")) {
      setActiveTab("achievements");
      document.title = "Accomplishment and Achievements";
    } else if (location.pathname.includes("/admin/transparency")) {
      setActiveTab("transparency");
      document.title = "Transparency Dashboard";
    }
  }, [location.pathname]);

  // Shared classes for inactive tabs with hover effect
  const inactiveClasses =
    "flex flex-row gap-2 p-3 rounded-xl bg-gray-200 cursor-pointer transition duration-300 ease-in-out hover:bg-gray-300 hover:scale-105";

  // Shared classes for active tabs
  const activeClasses =
    "flex flex-row gap-2 p-3 rounded-xl bg-green-700 text-white cursor-pointer transition duration-300 ease-in-out";

  return (
    <div className="w-full sticky top-0 flex items-center justify-start gap-4">
      {/* Transparency Dashboard */}
      {activeTab === "transparency" ? (
        <div className={activeClasses}>
          <RiFundsBoxLine size={16} />
          <p className="hidden lg:block text-sm font-normal">
            Transparency Dashboard
          </p>
        </div>
      ) : (
        <div
          className={inactiveClasses}
          onClick={() => navigate("/admin/transparency")}
        >
          <RiFundsBoxLine size={16} />
          <p className="hidden lg:block text-sm font-normal">
            Transparency Dashboard
          </p>
        </div>
      )}

      {/* Budgets */}
      {activeTab === "budgets" ? (
        <div className={activeClasses}>
          <RiMoneyDollarCircleLine size={16} />
          <p className="hidden lg:block text-sm font-normal">Budget Overview</p>
        </div>
      ) : (
        <div
          className={inactiveClasses}
          onClick={() => navigate("/admin/transparency/budgets")}
        >
          <RiMoneyDollarCircleLine size={16} />
          <p className="hidden lg:block text-sm font-normal">Budget Overview</p>
        </div>
      )}

      {/* Updates */}
      {activeTab === "updates" ? (
        <div className={activeClasses}>
          <RiFolderChartLine size={16} />
          <p className="hidden lg:block text-sm font-normal">Project Updates</p>
        </div>
      ) : (
        <div
          className={inactiveClasses}
          onClick={() => navigate("/admin/transparency/updates")}
        >
          <RiFolderChartLine size={16} />
          <p className="hidden lg:block text-sm font-normal">Project Updates</p>
        </div>
      )}

      {/* Achievements */}
      {activeTab === "achievements" ? (
        <div className={activeClasses}>
          <RiMedalLine size={16} />
          <p className="hidden lg:block text-sm font-normal">Achievements</p>
        </div>
      ) : (
        <div
          className={inactiveClasses}
          onClick={() => navigate("/admin/transparency/achievements")}
        >
          <RiMedalLine size={16} />
          <p className="hidden lg:block text-sm font-normal">Achievements</p>
        </div>
      )}
    </div>
  );
};

export default AdminTransparency;

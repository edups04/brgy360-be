import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";
import BACKEND_API from "../utils/API";

const ChatsContext = createContext<any>(null);

export const ChatsProvider = ({ children }: any) => {
  const [userChats, setUserChats] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [allUnreadMessageCountAdmin, setAllUnreadMessageCountAdmin] =
    useState(0);

  // * GET INITIAL UNREAD MESSAGES COUNT
  const getUnreadMessageCount = async () => {
    let CURRENT_USER = JSON.parse(localStorage.getItem("user"));
    if (CURRENT_USER) {
      // console.log("CURRENT USER : ", CURRENT_USER);
      const response = await axios.get(
        `${BACKEND_API}/chat-bot-messages?userId=${CURRENT_USER._id}`
      );
      if (response.data.success) {
        // console.log(response.data);
        setUnreadMessageCount(response.data.unreadMessagesCount || 0);
      }
    }
  };

  const getUserChats = async (userId: string) => {
    try {
      let url = `${BACKEND_API}/chat-bot-messages?userId=${userId}`;
      // let url = `http://localhost:8080/api/chat-bot-messages?userId=${userId}`;

      let response = await axios.get(url);

      if (response.data.success === true) {
        setUserChats(response.data.data);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const getAdminChats = async (barangayId: string) => {
    try {
      let url = `${BACKEND_API}/chat-bot-messages?grouped=true&barangayId=${barangayId}`;
      // let url = `http://localhost:8080/api/chat-bot-messages?grouped=true&barangayId=${barangayId}`;

      let response = await axios.get(url);

      if (response.data.success === true) {
        let allUnreadAdminChats = 0;
        // console.log("FIRST ADMIN CHAT : ", response.data.data[0]);
        // * SET THE COUNT FOR UNREAD ADMIN CHATS
        response.data.data.forEach((chat) => {
          allUnreadAdminChats += chat.unreadCount;
        });

        setAllUnreadMessageCountAdmin(allUnreadAdminChats);
        setAdminChats(response.data.data);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    let user = localStorage.getItem("user");
    if (user) {
      getUnreadMessageCount();
      getAdminChats(JSON.parse(user).barangayId);
    }
  }, []);

  return (
    <ChatsContext.Provider
      value={{
        getUserChats,
        userChats,
        adminChats,
        getAdminChats,
        unreadMessageCount,
        setUnreadMessageCount,
        getUnreadMessageCount,
        allUnreadMessageCountAdmin,
        setAllUnreadMessageCountAdmin,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChats = () => useContext(ChatsContext);

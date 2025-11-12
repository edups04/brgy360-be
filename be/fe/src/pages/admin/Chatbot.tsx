import React, { useEffect, useRef, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { useChats } from "../../providers/ChatsProvider";
import { RiSendPlaneFill, RiSearchLine } from "react-icons/ri";
import axios from "axios";
import { useUsers } from "../../providers/UsersProvider";
import BACKEND_API from "../../utils/API";
const Chatbot = () => {
  const { users, getUsers, totalPages } = useUsers();
  const { adminChats, getAdminChats } = useChats();
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [barangayId, setBarangayId] = useState("");

  // const selectedChat = adminChats.find(
  //   (chat: any) => chat.user._id === selectedUser
  // );

  const [selectedUserObject, setSelectedUserObject] = useState(null);

  const selectedChat =
    adminChats.find((chat: any) => chat.user._id === selectedUser) ||
    (selectedUserObject && {
      user: selectedUserObject,
      messages: [], // no messages yet
    });

  const handleUserClick = async (user: any) => {
    await updateMessageStatus(user._id);
    setSelectedUser(user._id);
    setSelectedUserObject(user); // Store full user object
  };

  const getUserDataBasedOnSearch = async () => {
    const user = localStorage.getItem("user");

    if (user) {
      const currUser = JSON.parse(user);

      if (currUser) {
        try {
          let url = `${BACKEND_API}/users/${currUser._id}`;
          // let url = `http://localhost:8080/api/users/${currUser._id}`;

          let response = await axios.get(url);

          if (response.data.success === true) {
            setBarangayId(response.data.data.barangayId);
            await getUsers(
              search,
              response.data.data.barangayId,
              1,
              1000,
              "",
              ""
            );
            console.log("users", users);
          }
        } catch (error: any) {
          console.log(error.response.data);
        }
      }
    }
  };

  useEffect(() => {
    getUserDataBasedOnSearch();
  }, [search]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat]);

  useEffect(() => {
    console.log("NEW MESSAGE RECEIVED UPDATE READ STATUS OF THE OPEN MESSAGE!");
    if (selectedUser) {
      updateMessageStatus(selectedUser);
    }
  }, [selectedChat && selectedChat.messages?.length]);

  // const getData = async () => {
  //   const user = localStorage.getItem("user");

  //   if (user) {
  //     const currUser = JSON.parse(user);

  //     if (currUser) {
  //       await getAdminChats(currUser.barangayId);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   getData();

  //   // const interval = setInterval(() => {
  //   //   getData();
  //   // }, 10000);

  //   // return () => clearInterval(interval);
  // }, []);

  const sendMessage = async () => {
    try {
      let url = `${BACKEND_API}/chat-bot-messages`;
      // let url = `http://localhost:8080/api/chat-bot-messages`;

      let response = await axios.post(url, {
        message: message,
        from: "chatbot",
        userId: selectedUser,
      });

      if (response.data.success === true) {
        console.log(response.data);
        // await getData();
        setMessage("");
        setSearch("");
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const updateMessageStatus = async (userId) => {
    try {
      if (userId) {
        let url = `${BACKEND_API}/chat-bot-messages/1`;
        let response = await axios.put(url, {
          status: "read",
          from: "user",
          userId: userId,
        });

        if (response.data.success === true) {
          console.log(response.data);
          let user = localStorage.getItem("user");
          if (user) {
            await getAdminChats(JSON.parse(user).barangayId);
          }
        }
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="flex flex-col lg:flex-row items-center justify-center">
        <div className="hidden lg:flex w-[100px]"></div>
        <div className="w-full flex flex-col items-center justify-center gap-6 px-4 py-6">
          {/* header */}
          <div className="w-full flex flex-row items-center justify-start">
            <p className="text-sm font-semibold capitalize">Messages</p>
          </div>
          {/* SEARCH USER TO MESSAGE */}
          <div className="w-full flex flex-col items-start justify-between gap-2">
            <div className="relative flex items-center justify-center">
              <input
                type="text"
                className="outline-none border border-green-700 text-sm font-normal w-full pl-10 pr-3 py-3 rounded-xl"
                placeholder="search for users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <RiSearchLine
                size={16}
                color="black"
                className="absolute left-4"
              />
            </div>
            {/* Overlay Dropdown */}
            {search && (
              <div className="w-full max-h-60 overflow-y-auto bg-white shadow-lg rounded-xl z-10">
                {users.length > 0 ? (
                  users
                    .filter(
                      (user: any) =>
                        user._id !==
                        JSON.parse(localStorage.getItem("user"))._id
                    )
                    .map((user, idx) => (
                      <div
                        key={idx}
                        className="flex flex-row items-center gap-4 px-4 py-2 hover:bg-green-600 hover:text-white cursor-pointer text-sm"
                        onClick={() => {
                          handleUserClick(user);
                        }}
                      >
                        <div
                          className="shrink-0 bg-cover bg-center h-[40px] w-[40px] bg-white rounded-full"
                          style={{
                            backgroundImage: `url("${BACKEND_API}/images/${user.profile}")`,
                          }}
                        ></div>
                        {user.firstName} {user.lastName}
                        {/* – {user.email} */}
                      </div>
                    ))
                ) : (
                  <div className="px-4 py-2 text-gray-400 text-sm">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
          {/* MESSAGES */}
          <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-2">
            {adminChats.length > 0 ? (
              <div className="w-full lg:w-1/4 flex flex-col items-center justify-center bg-gray-200 rounded-xl overflow-hidden overflow-y-auto max-h-[20vh] lg:max-h-[60vh]">
                {/* {adminChats.map((chat: any) => { */}
                {adminChats
                  .filter(
                    (chat: any) =>
                      chat.user._id !==
                      JSON.parse(localStorage.getItem("user"))._id
                  )
                  .sort((a, b) => {
                    const lastA = a.messages[a.messages.length - 1];
                    const lastB = b.messages[b.messages.length - 1];
                    return (
                      new Date(lastB.date).getTime() -
                      new Date(lastA.date).getTime()
                    );
                  })
                  .map((chat: any) => {
                    const isSelected = selectedUser === chat.user._id;

                    return (
                      <div
                        className={`w-full flex flex-row items-center justify-start p-4 gap-2 cursor-pointer ${
                          isSelected ? "bg-green-700 text-white" : ""
                        }`}
                        key={chat.user._id}
                        // onClick={() => setSelectedUser(chat.user._id)}
                        onClick={() => handleUserClick(chat.user)}
                      >
                        <div
                          className="shrink-0 bg-cover bg-center h-[40px] w-[40px] bg-white rounded-full"
                          style={{
                            backgroundImage: `url("${BACKEND_API}/images/${chat.user.profile}")`,
                          }}
                        ></div>
                        <p className="text-sm font-normal">{`${chat.user.firstName} ${chat.user.lastName}`}</p>
                        {chat.unreadCount > 0 &&
                          selectedUser !== chat.user?._id && (
                            <div className="ml-auto rounded-full px-2 py-1 min-w-8 text-center bg-red-500">
                              <span className="font-bold text-sm text-white">
                                {chat.unreadCount > 99
                                  ? "99+"
                                  : chat.unreadCount}
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="w-full lg:w-1/4 flex flex-col items-center justify-center bg-gray-200 rounded-xl overflow-hidden overflow-y-auto max-h-[20vh] lg:max-h-[60vh]">
                <div className="w-full flex items-center justify-center p-6">
                  <p className="text-sm font-normal">No Messages Found</p>
                </div>
              </div>
            )}

            {selectedChat ? (
              <div className="w-full lg:w-3/4 flex flex-col items-center justify-center gap-6 rounded-xl bg-gray-200 shadow-xl shadow-black/20 overflow-hidden">
                {/* image and user name */}
                <div className="w-full flex flex-row items-center justify-start gap-2 p-6 bg-white">
                  <div
                    className="shrink-0 bg-cover bg-center h-[40px] w-[40px] bg-gray-200 rounded-full"
                    style={{
                      backgroundImage: selectedChat
                        ? `url("${BACKEND_API}/images/${selectedChat.user.profile}")`
                        : "",
                    }}
                  ></div>
                  <p className="text-sm font-normal">
                    {selectedChat
                      ? `${selectedChat.user.firstName} ${selectedChat.user.lastName}`
                      : "User Name"}
                  </p>
                </div>

                {/* messages */}
                <div className="w-full flex flex-col items-start justify-start gap-2 p-6 min-h-[60vh] max-h-[60vh] overflow-y-auto">
                  {selectedChat?.messages.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl max-w-[75%] ${
                        msg.from === "user"
                          ? "bg-white self-start text-black"
                          : "bg-green-700 self-end text-white"
                      }`}
                    >
                      <p className="text-sm ">{msg.message}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* input */}
                <div className="w-full flex flex-row items-center justify-between gap-4 p-6 bg-white">
                  <input
                    type="text"
                    className="text-sm font-normal outline-none border border-green-700 p-3 rounded-xl w-full"
                    placeholder="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <RiSendPlaneFill
                    size={24}
                    color="green"
                    className="cursor-pointer"
                    onClick={sendMessage}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full lg:w-3/4 flex flex-col items-center justify-center gap-6 rounded-xl bg-white shadow-xl shadow-black/20 overflow-hidden min-h-[60vh]">
                <p>No Selected Chat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;

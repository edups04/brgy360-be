import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import BACKEND_API from "../utils/API";

const UpdatesContext = createContext<any>(null);

export const UpdatesProvider = ({ children }: any) => {
  const [updates, setUpdates] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [recentUpdates, setRecentUpdates] = useState([]);

  const getUpdates = async (
    title: string,
    barangayId: string,
    page: number,
    limit: number
  ) => {
    try {
      let url = `${BACKEND_API}/projects?title=${title}&barangayId=${barangayId}&page=${page}&limit=${limit}`;
      // let url = `http://localhost:8080/api/projects?title=${title}&barangayId=${barangayId}&page=${page}&limit=${limit}`;

      let response = await axios.get(url);

      if (response.data.success === true) {
        setUpdates(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  const getRecentUpdates = async (barangayId: string, limit: number) => {
    try {
      let url = `${BACKEND_API}/projects?limit=${limit}&barangayId=${barangayId}`;
      // let url = `http://localhost:8080/api/projects?limit=${limit}&barangayId=${barangayId}`;

      let response = await axios.get(url);

      if (response.data.success === true) {
        setRecentUpdates(response.data.data);
      }
    } catch (error: any) {
      console.log(error.response.data);
    }
  };

  return (
    <UpdatesContext.Provider
      value={{
        totalPages,
        updates,
        getUpdates,
        recentUpdates,
        getRecentUpdates,
      }}
    >
      {children}
    </UpdatesContext.Provider>
  );
};

export const useUpdates = () => useContext(UpdatesContext);

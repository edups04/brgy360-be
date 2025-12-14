import React, { useState } from "react";
import Logo from "../assets/LogoFull.png";
import { RiCheckLine, RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import axios from "axios";
import BACKEND_API from "../utils/API";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      let url = `${BACKEND_API}/users/login`;

      let response = await axios.post(url, {
        email: email,
        password: password,
      });

      if (response.data.success === true) {
        if (response.data.data.status === "active") {
          localStorage.setItem("user", JSON.stringify(response.data.data));
          if (response.data.data.role === "user") {
            navigate("/user/home");
            window.location.reload();
          } else if (response.data.data.role === "admin") {
            navigate("/admin/dashboard");
            window.location.reload();
          }
        } else {
          setShowModal(true);
          setError(true);
          setMessage(
            "Account Pending! Please wait for admins to approve your account"
          );
        }
      }
    } catch (error: any) {
      setShowModal(true);
      setError(true);
      setMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async () => {
    try {
      let url = `${BACKEND_API}/users/forgot-password`;

      let response = await axios.post(url, {
        email: email,
      });

      if (response.data.success === true) {
        setShowModal(true);
        setError(false);
        setMessage(response.data.message);
      } else {
        setShowModal(true);
        setError(true);
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setShowModal(true);
      setError(true);
      setMessage(error.response.data.message);
    }
  };

  return (
    <>
      <div className="w-full flex h-screen items-center justify-center bg-[#008A3D]">
        <div className="w-[320px] lg:w-1/4 flex flex-col items-center justify-center bg-white p-8 rounded-2xl gap-6">
          {/* title */}
          <div className="w-full flex flex-col items-center justify-center">
            <img src={Logo} alt="/" className="w-[150px]" />
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-[#008A3D]">BRGY 360</p>
              <p className="text-sm font-normal">Login to your account</p>
            </div>
          </div>
          {/* fields */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
            {/* email */}
            <div className="w-full flex flex-col items-start justify-center gap-2">
              <p className="text-sm font-normal">Email</p>
              <input
                type="text"
                className="text-sm font-normal outline-none border border-[#008A3D] p-3 w-full rounded-xl bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
              />
            </div>
            {/* password */}
            <div className="w-full flex flex-col items-start justify-center gap-2">
              <p className="text-sm font-normal">Password</p>
              <div className="w-full flex flex-row relative items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className="text-sm font-normal outline-none border border-[#008A3D] p-3 w-full rounded-xl bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="enter your password"
                />
                {showPassword ? (
                  <RiEyeLine
                    className="absolute right-4 cursor-pointer transition duration-300 ease-in-out hover:text-green-700"
                    size={12}
                    color="black"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <RiEyeCloseLine
                    className="absolute right-4 cursor-pointer transition duration-300 ease-in-out hover:text-green-700"
                    size={12}
                    color="black"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </div>
          </div>
          {/* misc */}
          <div className="w-full flex flex-row items-center">
            <div className="w-1/2 flex flex-row items-center justify-start gap-2">
              {remember ? (
                <div
                  className="w-3 h-3 rounded-sm outline outline-[#008A3D] bg-[#008A3D] cursor-pointer transition duration-300 ease-in-out hover:bg-green-700"
                  onClick={() => setRemember(!remember)}
                >
                  <RiCheckLine size={12} color="white" />
                </div>
              ) : (
                <div
                  className="w-3 h-3 rounded-sm outline outline-[#008A3D] cursor-pointer transition duration-300 ease-in-out hover:bg-green-700"
                  onClick={() => {
                    setRemember(!remember);
                  }}
                ></div>
              )}
              <p className="text-sm font-normal">Remember me</p>
            </div>
            <div className="w-1/2 flex flex-row items-center justify-end gap-2">
              <p
                className="text-sm font-normal text-green-600 cursor-pointer transition duration-300 ease-in-out hover:text-green-700"
                onClick={onForgotPassword}
              >
                Forgot Password
              </p>
            </div>
          </div>
          {/* button with indicator */}
          <div
            className={`w-full flex items-center justify-center bg-[#008A3D] py-3 rounded-xl text-white text-sm font-normal cursor-pointer transition duration-300 ease-in-out hover:bg-green-700 hover:scale-105 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={!loading ? onLogin : undefined}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login Now"
            )}
          </div>
          {/* redirect */}
          <p className="w-full flex flex-row items-center justify-center gap-1 text-sm font-normal whitespace-nowrap">
            Sign up as
            <span
              className="cursor-pointer text-[#008A3D] transition duration-300 ease-in-out hover:text-green-700"
              onClick={() => navigate("/register/admin")}
            >
              Admin
            </span>
            <span className="">or</span>
            <span
              className="cursor-pointer text-[#008A3D] transition duration-300 ease-in-out hover:text-green-700"
              onClick={() => navigate("/register/user")}
            >
              User
            </span>
          </p>
        </div>
      </div>
      {showModal && (
        <Modal
          error={error}
          message={message}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default Login;

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

  const onLogin = async () => {
    try {
      const url = `${BACKEND_API}/users/login`;
      const response = await axios.post(url, { email, password });

      if (response.data.success === true) {
        const userData = response.data.data;
        if (userData.status === "active") {
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData.role === "user") {
            navigate("/user/home");
            window.location.reload();
          } else if (userData.role === "admin") {
            navigate("/admin/dashboard");
            window.location.reload();
          }
        } else {
          setShowModal(true);
          setError(true);
          setMessage("Account Pending! Please wait for admins to approve your account");
        }
      }
    } catch (error: any) {
      setShowModal(true);
      setError(true);
      setMessage(error.response.data.message);
    }
  };

  const onForgotPassword = async () => {
    try {
      const url = `${BACKEND_API}/users/forgot-password`;
      const response = await axios.post(url, { email });

      setShowModal(true);
      setError(!response.data.success);
      setMessage(response.data.message);
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
          {/* Title */}
          <div className="w-full flex flex-col items-center justify-center">
            <img src={Logo} alt="Logo" className="w-[150px]" />
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-[#008A3D]">BRGY 360</p>
              <p className="text-sm font-normal">Login to your account</p>
            </div>
          </div>

          {/* Fields */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
            {/* Email */}
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

            {/* Password */}
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
                    className="absolute right-4 cursor-pointer"
                    size={12}
                    color="black"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <RiEyeCloseLine
                    className="absolute right-4 cursor-pointer"
                    size={12}
                    color="black"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Misc */}
          <div className="w-full flex flex-row items-center">
            <div className="w-1/2 flex flex-row items-center justify-start gap-2">
              {remember ? (
                <div
                  className="w-3 h-3 rounded-sm outline outline-[#008A3D] bg-[#008A3D] cursor-pointer flex items-center justify-center"
                  onClick={() => setRemember(!remember)}
                >
                  <RiCheckLine size={12} color="white" />
                </div>
              ) : (
                <div
                  className="w-3 h-3 rounded-sm outline outline-[#008A3D] cursor-pointer"
                  onClick={() => setRemember(!remember)}
                ></div>
              )}
              <p className="text-sm font-normal">Remember me</p>
            </div>
            <div className="w-1/2 flex flex-row items-center justify-end gap-2">
              <p
                className="text-sm font-normal text-green-600 cursor-pointer"
                onClick={onForgotPassword}
              >
                Forgot Password
              </p>
            </div>
          </div>

          {/* Button */}
          <div
            className="w-full flex items-center justify-center bg-[#008A3D] py-3 rounded-xl text-white text-sm font-normal cursor-pointer"
            onClick={onLogin}
          >
            Login Now
          </div>

          {/* Redirect */}
          <p className="w-full flex flex-row items-center justify-center gap-1 text-sm font-normal whitespace-nowrap">
            Sign up as{" "}
            <span
              className="cursor-pointer text-[#008A3D]"
              onClick={() => navigate("/register/admin")}
            >
              Admin
            </span>
            <span>or</span>
            <span
              className="cursor-pointer text-[#008A3D]"
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
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default Login;

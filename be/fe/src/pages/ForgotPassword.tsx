import React, { useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import { RiCheckLine, RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import axios from "axios";
import BACKEND_API from "../utils/API";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const { token } = useParams();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post(
          `${BACKEND_API}/users/verify-reset-token`,
          {
            token,
          }
        );

        if (response.data.success) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setMessage("Invalid or expired password reset link.");
          setError(true);
          setShowModal(true);
        }
      } catch (err) {
        setIsTokenValid(false);
        setMessage("Invalid or expired password reset link.");
        setError(true);
        setShowModal(true);
      }
    };

    verifyToken();
  }, [token]);

  if (isTokenValid === false) {
    navigate("/");
  }

  const onChangePassword = async () => {
    try {
      let url = `${BACKEND_API}/users/reset-password`;
      // let url = "http://localhost:8080/api/users/reset-password";

      let response = await axios.post(url, {
        token,
        password,
      });

      if (response.data.success === true) {
        setError(false);
      } else {
        setError(true);
      }
      setShowModal(true);
      setMessage(response.data.success);
      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (error: any) {
      setShowModal(true);
      setError(true);
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <div className="w-full flex h-screen items-center justify-center bg-[#008A3D]">
        <div className="w-[320px] lg:w-1/4 flex flex-col items-center justify-center bg-white p-8 rounded-2xl gap-6">
          {/* title */}
          <div className="w-full flex flex-col items-center justify-center">
            <img src={Logo} alt="/" className="w-[60px]" />
            <div className="flex flex-col items-center justify-center">
              <p className="font-bold text-[#008A3D]">BRGY 360</p>
              <p className="text-sm font-normal">Forgot Password</p>
            </div>
          </div>
          {/* fields */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
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
          {/* button */}
          <div
            className="w-full flex items-center justify-center bg-[#008A3D] py-3 rounded-xl text-white text-sm font-normal cursor-pointer"
            onClick={onChangePassword}
          >
            Confirm Change Password
          </div>
        </div>
      </div>
      {showModal && (
        <Modal
          error={error}
          message={message}
          onClose={() => {
            setShowModal(false);
            if (!isTokenValid) navigate("/login");
          }}
        />
      )}
    </>
  );
};

export default ForgotPassword;

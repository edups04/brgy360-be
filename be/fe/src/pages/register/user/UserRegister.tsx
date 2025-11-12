import React, { useEffect, useState } from "react";
import Logo from "../../../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import { RiAddLine, RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { ImGift } from "react-icons/im";
import { useBarangay } from "../../../providers/BarangayProvider";
import axios from "axios";
import Modal from "../../../components/Modal";
import BACKEND_API from "../../../utils/API";
import calculateAge from "../../../utils/Age";

const UserRegister = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [idType, setIdType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<File | null>(null);
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);

  const { barangays, getBarangays } = useBarangay();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  // * EMAIL VERIFICATION
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [backendConfirmationCode, setBackendConfirmationCode] = useState("");

  useEffect(() => {
    getBarangays();
  }, []);

  useEffect(() => {
    if (birthDate) {
      setAge(calculateAge(birthDate).toString());
    } else {
      setAge("");
    }
  }, [birthDate]);

  const sendConfirmationCode = async () => {
    try {
      if (password === rePassword) {
        let url = `${BACKEND_API}/users/verify-email`;

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("middleName", middleName);
        formData.append("lastName", lastName);
        formData.append("sex", sex);
        formData.append("birthdate", birthDate);
        formData.append("age", age);
        formData.append("email", email);
        formData.append("phoneNumber", mobileNumber);
        formData.append("password", password);
        formData.append("address", street);
        formData.append("type", idType);
        formData.append("role", "user");
        formData.append("barangayId", barangay);

        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success === true) {
          setError(false);
          setMessage(response.data.message);
          setShowModal(true);
          setBackendConfirmationCode(response.data.data);

          setTimeout(() => {
            setShowCodeModal(true);
          }, 1500);
        }
      } else {
        setShowModal(true);
        setMessage(
          "Passwords need to match in order to continue, please try again"
        );
        setError(true);
      }
    } catch (error: any) {
      if (error.response.data.error === "No recipients defined") {
        setMessage("Invalid email!");
      } else {
        setMessage(error.response.data.message);
      }
      setError(true);
      setShowModal(true);
    }
  };

  const registerUser = async () => {
    if (backendConfirmationCode !== confirmationCode) {
      setShowModal(true);
      setMessage("Incorrect Code!");
      setError(true);
      return;
    }

    if (password === rePassword) {
      try {
        let url = `${BACKEND_API}/users`;
        // let url = "http://localhost:8080/api/users";

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("middleName", middleName);
        formData.append("lastName", lastName);
        formData.append("sex", sex);
        formData.append("birthdate", birthDate);
        formData.append("age", age);
        formData.append("email", email);
        formData.append("phoneNumber", mobileNumber);
        formData.append("password", password);
        formData.append("address", street);
        profile && formData.append("profile", profile);
        formData.append("type", idType);
        front && formData.append("front", front);
        back && formData.append("back", back);
        formData.append("role", "user");
        formData.append("barangayId", barangay);

        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success === true) {
          setError(false);
          setMessage(response.data.message);
          setShowModal(true);

          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } catch (error: any) {
        setMessage(error.response.data.message);
        setError(true);
        setShowModal(true);
      }
    } else {
      setShowModal(true);
      setMessage(
        "Passwords need to match in order to continue, please try again"
      );
      setError(true);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile(file); // Store the file itself
    }
  };

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFront(file); // Store the file itself
    }
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBack(file); // Store the file itself
    }
  };

  return (
    <>
      <div className="w-full flex min-h-screen items-center justify-center bg-[#008A3D] py-6 overflow-auto">
        <div className="w-5/6 md:w-2/4 flex flex-col items-center justify-center gap-12 bg-white rounded-2xl p-6">
          {/* title */}
          <div className="w-full flex flex-row items-center justify-start gap-2">
            <img src={Logo} width={40} alt="/" />
            <p className="text-sm font-bold text-[#008A3D]">
              Create User Account
            </p>
          </div>
          {/* image */}
          <div className="w-full flex flex-row items-center justify-start gap-4">
            <div className="relative rounded-full">
              {/* show image here if theres an image */}
              <div className="h-[120px] w-[120px] rounded-full bg-black/10 overflow-hidden">
                {profile ? (
                  <img
                    src={URL.createObjectURL(profile)}
                    alt="/"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              {/* button for image uploading */}
              <label
                htmlFor="profileInput"
                className="absolute p-2 rounded-md bg-[#008A3D] right-1 bottom-1 cursor-pointer"
              >
                <RiAddLine size={16} color="white" />
              </label>
              <input
                id="profileInput"
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-4">
            {/* name */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">First Name</p>
                <input
                  type="text"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  placeholder="enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Middle Name</p>
                <input
                  type="text"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  placeholder="enter middle name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Last Name</p>
                <input
                  type="text"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  placeholder="enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            {/* mobile, email */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Mobile Number</p>
                <input
                  type="text"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  placeholder="enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setMobileNumber(value.slice(0, 11));
                  }}
                />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Email</p>
                <input
                  type="text"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  placeholder="enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* address */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Barangay</p>
                <select
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full p-3 rounded-xl outline-none border border-[#008A3D] text-sm font-normal"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {barangays &&
                    barangays.map((barangay: any) => (
                      <option value={barangay._id} key={barangay._id}>
                        {barangay.barangayName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Street No.</p>
                <input
                  type="text"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  placeholder="enter street number"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
            </div>
            {/* birthday, age, sex */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
              <div className="w-full lg:w-2/4 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Birthday</p>
                <input
                  type="date"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="w-full lg:w-1/4 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Age</p>
                <input
                  type="text"
                  className="outline-none border border-[#008A3D] p-3 rounded-xl text-sm font-normal w-full"
                  placeholder="enter age"
                  value={age}
                  disabled
                  // onChange={(e) => {
                  //   const value = e.target.value.replace(/\D/g, "");
                  //   setAge(value.slice(0, 2));
                  // }}
                />
              </div>
              <div className="w-full lg:w-1/4 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Sex</p>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full p-3 rounded-xl outline-none border border-[#008A3D] text-sm font-normal"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            {/* passwords */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
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
              <div className="w-full lg:w-1/2 flex flex-col items-start justify-center gap-2">
                <p className="text-sm font-normal">Confirm Password</p>
                <div className="w-full flex flex-row relative items-center">
                  <input
                    type={showRePassword ? "text" : "password"}
                    className="text-sm font-normal outline-none border border-[#008A3D] p-3 w-full rounded-xl bg-white"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    placeholder="re-enter your password"
                  />
                  {showRePassword ? (
                    <RiEyeLine
                      className="absolute right-4 cursor-pointer"
                      size={12}
                      color="black"
                      onClick={() => setShowRePassword(!showRePassword)}
                    />
                  ) : (
                    <RiEyeCloseLine
                      className="absolute right-4 cursor-pointer"
                      size={12}
                      color="black"
                      onClick={() => setShowRePassword(!showRePassword)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* id */}
          <div className="w-full flex flex-col items-center justify-center gap-4">
            {/* id type */}
            <div className="w-full flex flex-col items-start justify-center gap-2">
              <p className="text-sm font-normal">Choose Valid ID</p>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="text-sm font-normal outline-none border border-[#008A3D] p-3 rounded-xl"
              >
                <option value="" disabled>
                  Select ID
                </option>
                <option value="national-id">National ID </option>
                <option value="sss-id">SSS ID </option>
                <option value="philhealth-id">National ID </option>
                <option value="postal-id">Postal ID </option>
                <option value="voters-id">Voter's ID </option>
              </select>
            </div>
            {/* image */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
              {/* show the image here as background image */}
              <div
                className="w-full lg:w-1/2 bg-black/10 h-[220px] rounded-xl gap-2 flex flex-col items-center justify-center"
                style={{
                  backgroundImage: front
                    ? `url(${URL.createObjectURL(front)})`
                    : "",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <label className="p-2 rounded-xl bg-white cursor-pointer">
                  <RiAddLine size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFrontChange}
                    className="hidden"
                    disabled={idType ? false : true}
                  />
                </label>
                <p className="text-sm font-normal">Front</p>
              </div>
              <div
                className="w-full lg:w-1/2 bg-black/10 h-[220px] rounded-xl gap-2 flex flex-col items-center justify-center"
                style={{
                  backgroundImage: back
                    ? `url(${URL.createObjectURL(back)})`
                    : "",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <label className="p-2 rounded-xl bg-white cursor-pointer">
                  <RiAddLine size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackChange}
                    className="hidden"
                    disabled={idType ? false : true}
                  />
                </label>
                <p className="text-sm font-normal">Back</p>
              </div>
            </div>
          </div>
          {/* buttons */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
            <div
              className="w-full lg:w-1/2 flex items-center justify-center truncate bg-black/10 p-3 rounded-xl text-sm font-normal cursor-pointer"
              onClick={() => navigate("/")}
            >
              Cancel
            </div>
            <div
              className="w-full lg:w-1/2 flex items-center justify-center truncate bg-black p-3 rounded-xl text-sm font-normal text-white cursor-pointer"
              onClick={sendConfirmationCode}
            >
              Create Account
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal
          message={message}
          error={error}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}

      {/* * CONFIRMATION CODE HERE */}
      {showCodeModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-row items-center justify-start gap-2">
              <img src={Logo} width={32} alt="logo" />
              <p className="text-[#008A3D] font-bold text-lg">
                Enter Confirmation Code
              </p>
            </div>

            {/* Instructions */}
            <p className="text-sm text-gray-600">
              Please enter the 6-digit confirmation code sent to your email or
              mobile number.
            </p>

            {/* Input */}
            <input
              type="text"
              maxLength={6}
              value={confirmationCode}
              onChange={(e) =>
                setConfirmationCode(e.target.value.replace(/\D/g, ""))
              }
              className="border border-[#008A3D] p-3 rounded-xl outline-none text-center tracking-widest text-lg font-bold text-[#008A3D]"
              placeholder="______"
            />

            {/* Actions */}
            <div className="flex flex-row justify-end gap-3">
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={registerUser}
                className="bg-[#008A3D] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#006c30]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserRegister;

// src/components/Button.tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex p-3 rounded-xl bg-green-700 text-white font-normal text-sm mt-6 cursor-pointer 
                  transition duration-300 ease-in-out hover:bg-green-800 hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

import React from "react";

export default function InteractiveButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`interactive-btn ${className}`}
    >
      {children}
    </button>
  );
}

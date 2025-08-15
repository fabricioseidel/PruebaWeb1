"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast, { ToastType } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");

  const showToast = (message: string, type: ToastType = "info") => {
    setMessage(message);
    setType(type);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast 
        show={show} 
        message={message} 
        type={type} 
        onClose={handleClose} 
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

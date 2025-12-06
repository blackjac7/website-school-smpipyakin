"use client";

import { useState } from "react";
import {
  LogoutButton,
  SidebarLogout,
  LogoutConfirmModal,
  ToastNotification,
  LogoutAnimation,
} from "@/components/shared";

/**
 * LogoutDemo component.
 * Demonstrates the usage of various logout-related components.
 * Includes buttons for simple logout, profile dropdown, sidebar logout, and manual controls for modals and animations.
 * @returns {JSX.Element} The rendered LogoutDemo component.
 */
export default function LogoutDemo() {
  const [showModal, setShowModal] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: "success" | "error" | "info" | "warning";
      message: string;
      description?: string;
      onClose: (id: string) => void;
    }>
  >([]);

  const addToast = (
    type: "success" | "error" | "info" | "warning",
    message: string
  ) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      type,
      message,
      description: `Demo toast notification - ${type}`,
      onClose: (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
    };
    setToasts((prev) => [...prev, newToast]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Logout Components Demo
        </h1>

        {/* Button Variants Demo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Simple Logout</h3>
            <LogoutButton
              variant="simple"
              userName="John Doe"
              userRole="Demo User"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Profile Dropdown</h3>
            <LogoutButton
              variant="profile"
              userName="Jane Smith"
              userRole="Administrator"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Dropdown Only</h3>
            <LogoutButton
              variant="dropdown"
              userName="Mike Johnson"
              userRole="Teacher"
            />
          </div>
        </div>

        {/* Sidebar Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <h3 className="text-lg font-semibold p-4 border-b">
              Sidebar Logout
            </h3>
            <div className="h-64">
              <SidebarLogout userName="Demo User" userRole="Sample Role" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Manual Controls</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowModal(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show Confirmation Modal
              </button>

              <button
                onClick={() => setShowAnimation(true)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Show Logout Animation
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addToast("success", "Success message")}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Success Toast
                </button>

                <button
                  onClick={() => addToast("error", "Error message")}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Error Toast
                </button>

                <button
                  onClick={() => addToast("info", "Info message")}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Info Toast
                </button>

                <button
                  onClick={() => addToast("warning", "Warning message")}
                  className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                >
                  Warning Toast
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Features Implemented</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Multiple logout button variants
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Elegant confirmation modals
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Sidebar integration
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Loading states & animations
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Toast notifications system
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Full-screen logout animation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Responsive design
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                TypeScript support
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      <LogoutConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false);
          addToast("success", "Logout confirmed!");
        }}
        userName="Demo User"
      />

      <LogoutAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
      />

      <ToastNotification
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}

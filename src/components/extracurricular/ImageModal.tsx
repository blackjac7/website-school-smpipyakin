"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

/**
 * ImageModal component.
 * Displays a modal with a larger view of an image.
 * Includes a close button and click-outside-to-close functionality.
 * @param {ImageModalProps} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {string} props.imageUrl - The URL of the image to display.
 * @param {string} props.title - The title or caption for the image.
 * @returns {JSX.Element | null} The rendered ImageModal component or null if not open.
 */
const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(true);
      setTimeout(() => setIsClosing(false), 300);
    }
  }, [isOpen]);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      onClick={handleOutsideClick}
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
    >
      <div className="relative w-full max-w-4xl mx-4 mt-16">
        <button
          onClick={() => {
            setIsClosing(true);
            setTimeout(onClose, 300);
          }}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="bg-white rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            width={1024}
            height={600}
            className="w-full h-auto object-contain max-h-[80vh]"
          />
          <div className="p-4 bg-white text-center">
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

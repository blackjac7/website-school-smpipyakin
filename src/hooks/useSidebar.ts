import { useState, useEffect } from "react";

export function useSidebar(initialState = true) {
  const [isOpen, setIsOpen] = useState(initialState);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Set initial state based on current window size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isOpen, setIsOpen };
}

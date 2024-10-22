import React, { createContext, useContext, useEffect, useState, ReactNode, MouseEvent, KeyboardEvent } from "react";
import getScrollBarWidth from "./utils/getScrollBarWidth";

interface ModalContextType {
  modalIsOpen: boolean;
  handleOpen: (event: MouseEvent | KeyboardEvent) => void;
  handleClose: (event: MouseEvent | KeyboardEvent) => void;
}

interface ModalProviderProps {
  children: ReactNode;
  [key: string]: any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

const ModalProvider: React.FC<ModalProviderProps> = ({ children, ...props }) => {
  const isSSR = typeof window === "undefined";
  const htmlTag = !isSSR && document.querySelector("html");
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const modalAnimationDuration = 400;

  // Handle open
  const handleOpen = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    if (htmlTag) {
      setModalIsOpen(true);
      htmlTag.classList.add("modal-is-open", "modal-is-opening");
      setTimeout(() => {
        htmlTag.classList.remove("modal-is-opening");
      }, modalAnimationDuration);
    }
  };

  // Handle close
  const handleClose = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    if (htmlTag) {
      htmlTag.classList.add("modal-is-closing");
      setTimeout(() => {
        setModalIsOpen(false);
        htmlTag.classList.remove("modal-is-open", "modal-is-closing");
      }, modalAnimationDuration);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!modalIsOpen) return;
      if (event.key === "Escape") {
        handleClose(event);
      }
    };
    //@ts-ignore
    window.addEventListener("keydown", handleEscape);
    return () => {
          //@ts-ignore
      window.removeEventListener("keydown", handleEscape);
    };
  }, [modalIsOpen]);

  // Set scrollbar width on mount
  useEffect(() => {
    const scrollBarWidth = getScrollBarWidth();
    if (htmlTag) {
      htmlTag.style.setProperty("--pico-scrollbar-width", `${scrollBarWidth}px`);
      return () => {
        htmlTag.style.removeProperty("--pico-scrollbar-width");
      };
    }
  }, [htmlTag]);

  return (
    <ModalContext.Provider
      value={{
        modalIsOpen,
        handleOpen,
        handleClose,
        ...props,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export { ModalProvider, useModal };

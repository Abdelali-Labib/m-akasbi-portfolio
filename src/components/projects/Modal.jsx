"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaYoutube, FaPlay, FaVideo, FaList } from "react-icons/fa";

const Modal = ({ isModalOpen, embedSrc, closeModal, title = "", type = "" }) => {
  const iframeRef = useRef(null);

  // Force iframe to reload when the source changes
  useEffect(() => {
    if (iframeRef.current && embedSrc) {
      iframeRef.current.src = embedSrc;
    }
  }, [embedSrc]);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    if (isModalOpen) {
      html.classList.add("overflow-hidden");
      body.classList.add("overflow-hidden");
    } else {
      html.classList.remove("overflow-hidden");
      body.classList.remove("overflow-hidden");
    }
    return () => {
      html.classList.remove("overflow-hidden");
      body.classList.remove("overflow-hidden");
    };
  }, [isModalOpen]);

  // Determine content type for better labeling
  const getContentType = () => {
    if (type === "video") return { label: "Vidéo", icon: FaVideo, color: "text-accent" };
    if (type === "playlist") return { label: "Playlist", icon: FaList, color: "text-accent" };
    return { label: "Contenu YouTube", icon: FaYoutube, color: "text-accent" };
  };

  const contentType = getContentType();
  const ContentIcon = contentType.icon;

  if (!isModalOpen || !embedSrc) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* External Close Button */}
      <button
        onClick={closeModal}
        className="fixed top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 z-[10000] hover:scale-110 active:scale-95"
        aria-label="Close Modal"
      >
        <FaTimes size={20} />
      </button>

      {/* Modal Container */}
      <div className="relative bg-black rounded-2xl w-full max-w-4xl z-10">
        {/* Header */}
        {title && (
          <div className="p-6 pb-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
          </div>
        )}

        {/* Video Container */}
        <div className="p-6 pt-0">
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
              ref={iframeRef}
              src={embedSrc}
              title={title || "YouTube video player"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <div className="flex items-center justify-center gap-4 text-white/80 bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <ContentIcon className={`text-lg flex items-center gap-2 ${contentType.color}`}/>
              <span className="font-medium">{contentType.label}</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <FaYoutube className="text-red-500" />
              <span className="text-sm">YouTube</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : document.createElement("div")
  );
};

export default Modal;

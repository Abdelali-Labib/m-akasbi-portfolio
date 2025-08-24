import React from "react";
import Image from "next/image";
import { RxVideo } from "react-icons/rx";

const VideosSection = ({ videos, openModal }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6 px-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/25 to-accent/15 border border-accent/40 flex items-center justify-center">
          <RxVideo className="h-6 w-6 text-accent" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary dark:text-light">
          Projets <span className="text-accent">Vidéo</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700 hover:border-accent/40 cursor-pointer"
            onClick={() => openModal(video, "video")}
          >
            {/* Glow border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />

            <div className="relative h-56 w-full">
              <Image
                src={video.thumbnail}
                alt={video.title}
                priority
                quality={85}
                fill
                sizes="100%"
                className="object-cover"
              />

              {/* Type badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-accent/25 to-accent/20 rounded-xl border border-accent/40 backdrop-blur-sm">
                <span className="text-accent text-xs font-semibold uppercase tracking-wider">Vidéo</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <span className="px-4 py-2 rounded-xl bg-accent/20 border border-accent/40 text-light font-medium">
                  Voir la vidéo →
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-primary dark:text-light group-hover:text-accent transition-colors duration-300 line-clamp-2">
                {video.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VideosSection;

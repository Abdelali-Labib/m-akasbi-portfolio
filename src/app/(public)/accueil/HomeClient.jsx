"use client";

import Picture from "@/components/home/Picture";
import SocialMedia from "@/components/home/SocialMedia";
import Statistics from "@/components/home/Statistics";
import { FiDownload, FiArrowRight, FiPlay, FiAward } from "react-icons/fi";
import AnimatedItem from "@/components/ui/AnimatedItem";
import { useRouter } from "next/navigation";

/**
 * Home page client component for main landing page UI.
 * @param {object} props - Component props
 * @param {object} props.homeContent - Home page content
 * @param {Array<object>} props.statistics - Statistics data
 * @param {object} props.socialMedia - Social media links
 * @param {object} props.profileInfo - Profile info (picture URL)
 * @param {object} props.pageContent - Page content (labels/text)
 */
export default function HomeClient({
  homeContent = { subtitle: "", descriptions: [] },
  statistics = [],
  socialMedia = {},
  profileInfo = {},
  pageContent = {},
}) {
  const router = useRouter();

  /**
   * Handles CV download button click. Opens API route to trigger download.
   */
  const handleDownloadCv = () => {
  // Open CV download endpoint (tracking is server-side)
    window.open('/api/cv', '_blank');
  };

  // Default content values for home page
  const defaultContent = {
    badge: "Art & visuel • Créateur de contenu",
    greeting: "Bonjour, je suis",
    name: "Mouhcine AKASBI",
    downloadCv: "Télécharger CV",
    viewProjects: "Voir mes projets",
    followMe: "Suivez-moi sur"
  };

  // Merge fetched content with default values
  const content = { ...defaultContent, ...pageContent };

  return (
    <section className="page-container">
      <div className="page-content">
        <div className="flex flex-grow flex-col items-center justify-center text-center xl:items-start xl:text-left">
          <div className="content-section badge-top-align">
            <AnimatedItem delay={200}>
              <div className="enhanced-badge">
                <FiAward className="mr-2 h-3 w-3 sm:mr-3 sm:h-4 sm:w-4" />
                {content.badge}
              </div>
            </AnimatedItem>

            <AnimatedItem delay={300}>
              <div className="heading-section">
                <h1 className="h1">
                  <span className="main-heading">{content.greeting}</span>
                  <span className="accent-heading">
                    {content.name}
                  </span>
                </h1>
                <p className="subtitle">{homeContent.subtitle}</p>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={400}>
              <div className="description-section">
                <p className="description-text" style={{ whiteSpace: 'pre-line' }}>
                  {homeContent.description}
                </p>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={500}>
              <div className="action-buttons">
                <button
                  onClick={handleDownloadCv}
                  className="btn-primary-cta group relative overflow-hidden rounded-full border-2 border-accent bg-gradient-to-r from-accent to-accent/90 px-6 py-3 sm:px-8 sm:py-4 font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                    {content.downloadCv}
                    <FiDownload className="text-base sm:text-lg md:text-xl transition-transform duration-300 group-hover:translate-y-1" />
                  </span>
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </button>

                <button
                  onClick={() => router.push('/projets')}
                  className="btn-secondary-cta group relative overflow-hidden rounded-full border-2 border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5 px-6 py-3 sm:px-8 sm:py-4 font-bold text-accent shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-accent/50 hover:bg-accent/20"
                >
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                    <FiPlay className="text-base sm:text-lg md:text-xl transition-transform duration-300 group-hover:scale-110" />
                    {content.viewProjects}
                    <FiArrowRight className="text-base sm:text-lg md:text-xl transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={600}>
              <div className="social-section">
                <p className="social-label text-sm sm:text-base text-primary/60 dark:text-light/60 mb-6 sm:mb-8 text-center xl:text-left">{content.followMe}</p>
                <SocialMedia socialLinks={socialMedia} />
              </div>
            </AnimatedItem>
          </div>
        </div>

        <div className="order-first flex justify-center xl:order-none">
          <div className="relative">
            <Picture profileInfo={profileInfo} />
          </div>
        </div>
      </div>

      <div className="section-spacing">
        <Statistics statistics={statistics} content={pageContent.statistics} />
      </div>
    </section>
  );
}

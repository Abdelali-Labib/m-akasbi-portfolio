import FirestoreService from "@/lib/firestore-service";
import HomeClient from "./HomeClient";

/**
 * Fetches data for the home page from Firestore.
 * Updated to match new SiteContent structure
 * @returns {Promise<{content: object, statistics: Array<object>, socialMedia: object, profileInfo: object, pageContent: object}>} The fetched data.
 */
async function getHomeData() {
  const [homeData, pageContent] = await Promise.all([
    FirestoreService.getHomeData(),
    FirestoreService.getStaticContent('home')
  ]);
  
  return {
    ...homeData,
    pageContent
  };
}

/**
 * Home page component - Server-side data fetching for the main landing page.
 */
export default async function Accueil() {
  try {
    const homeData = await getHomeData();
    const { content, statistics, socialMedia, profileInfo, pageContent } = homeData || {};

    // Ensure statistics is always an array
    const safeStatistics = Array.isArray(statistics) ? statistics : [];

    return (
      <HomeClient
        homeContent={content || { 
          subtitle: "Passionné d'audiovisuel & créateur digital", 
          description: "Passionné d'audiovisuel, je réalise et expérimente divers projets vidéo. Curieux et adaptable, j'apporte une perspective innovante et m'implique pleinement dans de nouveaux défis. Prêt à collaborer, je cherche à développer mes compétences et à créer des contenus visuels captivants qui inspirent et engagent."
        }}
        statistics={safeStatistics}
        socialMedia={socialMedia || {}}
        profileInfo={profileInfo || {}}
        pageContent={pageContent || {}}
      />
    );
  } catch (error) {
    
    // Return fallback UI in case of error
    return (
      <HomeClient
        homeContent={{ 
          subtitle: "Passionné d'audiovisuel & créateur digital", 
          description: "Passionné d'audiovisuel, je réalise et expérimente divers projets vidéo. Curieux et adaptable, j'apporte une perspective innovante et m'implique pleinement dans de nouveaux défis. Prêt à collaborer, je cherche à développer mes compétences et à créer des contenus visuels captivants qui inspirent et engagent."
        }}
        statistics={[]}
        socialMedia={{}}
        profileInfo={{}}
        pageContent={{}}
      />
    );
  }
}

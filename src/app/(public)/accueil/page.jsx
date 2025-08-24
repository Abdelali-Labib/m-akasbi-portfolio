import FirestoreService from "@/lib/firestore-service";
import HomeClient from "./HomeClient";

/**
 * Fetches data for the home page from Firestore.
 * @returns {Promise<{homeContent: object, statistics: Array<object>, socialMedia: object, profileInfo: object, pageContent: object}>} The fetched data.
 */
async function getHomeData() {
  const [homeData, profileInfo, pageContent] = await Promise.all([
    FirestoreService.getHomeData(),
    FirestoreService.getProfileInfo(),
    FirestoreService.getStaticContent('home')
  ]);
  
  return {
    ...homeData,
    profileInfo,
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
        homeContent={content || { subtitle: "", descriptions: [] }}
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
        homeContent={{ subtitle: "", descriptions: [] }}
        statistics={[]}
        socialMedia={{}}
        profileInfo={{}}
        pageContent={{}}
      />
    );
  }
}

import FirestoreService from "@/lib/firestore-service";
import ProjectsClient from "./ProjectsClient";

/**
 * Fetches and categorizes project data from Firestore.
 * @returns {Promise<{videos: Array<object>, playlists: Array<object>, images: Array<object>}>} A promise that resolves to the categorized projects.
 */
async function getProjectsData() {
  return await FirestoreService.getProjects();
}

/**
 * Fetches content for the projects page.
 * @returns {Promise<object>} A promise that resolves to the page content.
 */
async function getProjectsContent() {
  return await FirestoreService.getStaticContent('projects');
}

/**
 * Projects page component - Server-side data fetching for the projects page.
 */
export default async function ProjectsPage() {
  const [projectsData, content] = await Promise.all([
    getProjectsData(),
    getProjectsContent()
  ]);
  
  const { videos, playlists, images } = projectsData;
  
  return (
    <ProjectsClient 
      videos={videos || []} 
      playlists={playlists || []} 
      images={images || []}
      content={content || {}}
    />
  );
}


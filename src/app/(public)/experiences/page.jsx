export const revalidate = 60;
import FirestoreService from "@/lib/firestore-service";
import ExperiencesClient from "./ExperiencesClient";

/**
 * Fetches and separates experiences data from Firestore into work and film categories.
 * @returns {Promise<{workExperiences: Array<object>, filmExperiences: Array<object>}>} A promise that resolves to the categorized experiences.
 */
async function getExperiencesData() {
  return await FirestoreService.getExperiences();
}

/**
 * Fetches content for the experiences page.
 * @returns {Promise<object>} A promise that resolves to the page content.
 */
async function getExperiencesContent() {
  return await FirestoreService.getStaticContent('experiences');
}

/**
 * Experiences page component - Server-side data fetching for the experiences page.
 */
export default async function ExperiencesPage() {
  const [experiencesData, content] = await Promise.all([
    getExperiencesData(),
    getExperiencesContent()
  ]);
  
  const { workExperiences, filmExperiences } = experiencesData;
  
  return (
    <ExperiencesClient 
      workExperiences={workExperiences || []} 
      filmExperiences={filmExperiences || []}
      content={content || {}}
    />
  );
}

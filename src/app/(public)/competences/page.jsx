export const revalidate = 60;
import FirestoreService from "@/lib/firestore-service";
import SkillsClient from "./SkillsClient";

/**
 * Fetches and structures the skills data from Firestore.
 * @returns {Promise<Array<object>>} A promise that resolves to the structured sections array.
 */
async function getSkillsData() {
  return await FirestoreService.getSkills();
}

/**
 * Fetches content for the skills page.
 * @returns {Promise<object>} A promise that resolves to the page content.
 */
async function getSkillsContent() {
  return await FirestoreService.getStaticContent('skills');
}

/**
 * Skills page component - Server-side data fetching for the skills page.
 */
export default async function SkillsPage() {
  const [sections, content] = await Promise.all([
    getSkillsData(),
    getSkillsContent()
  ]);
  
  return <SkillsClient sections={sections || []} content={content || {}} />;
}
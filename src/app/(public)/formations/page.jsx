export const revalidate = 60;
import FirestoreService from "@/lib/firestore-service";
import FormationsClient from "./FormationsClient";

/**
 * Fetches formations data from Firestore, ordered by year descending.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of formation objects.
 */
async function getFormationsData() {
  return await FirestoreService.getFormations();
}

/**
 * Fetches content for the formations page.
 * @returns {Promise<object>} A promise that resolves to the page content.
 */
async function getFormationsContent() {
  return await FirestoreService.getStaticContent('formations');
}

/**
 * Formations page component - Server-side data fetching for the formations page.
 */
export default async function FormationsPage() {
  const [formations, content] = await Promise.all([
    getFormationsData(),
    getFormationsContent()
  ]);
  
  return <FormationsClient formations={formations || []} content={content || {}} />;
}


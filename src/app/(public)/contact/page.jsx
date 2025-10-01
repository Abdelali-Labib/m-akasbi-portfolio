export const revalidate = 60;
import FirestoreService from "@/lib/firestore-service";
import ContactClient from "./ContactClient";

/**
 * Fetches contact information from Firestore.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of contact info objects.
 */
async function getContactInfo() {
  return await FirestoreService.getContactInfo();
}

/**
 * Fetches content for the contact page.
 * @returns {Promise<object>} A promise that resolves to the page content.
 */
async function getContactContent() {
  return await FirestoreService.getStaticContent('contact');
}

/**
 * Contact page component - Server-side data fetching for the contact page.
 */
export default async function ContactPage() {
  const [contactInfo, content] = await Promise.all([
    getContactInfo(),
    getContactContent()
  ]);
  
  return <ContactClient contactInfo={contactInfo || []} content={content || {}} />;
}

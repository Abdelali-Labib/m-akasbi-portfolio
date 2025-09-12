import AdminClient from "./AdminClient";
import FirestoreService from "@/lib/firestore-service";

/**
 * Admin page component - Server-side component that renders the admin dashboard.
 * Authentication and client-side logic are handled in AdminClient.
 */
export default async function AdminPage() {
  // Fetch analytics data on the server side
  const analyticsData = await FirestoreService.getAnalyticsData();
  
  return <AdminClient analyticsData={analyticsData} />;
}

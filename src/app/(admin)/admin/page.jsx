import AdminClient from "./AdminClient";
import FirestoreService from "@/lib/firestore-service";

export default async function AdminPage() {
  const analyticsData = await FirestoreService.getAnalyticsData();
  
  return <AdminClient analyticsData={analyticsData} />;
}

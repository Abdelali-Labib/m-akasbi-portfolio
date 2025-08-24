import FirestoreService from '@/lib/firestore-service';

export async function GET() {
  try {
    const debugResults = await FirestoreService.debugCollections();
    
    return Response.json({ 
      success: true, 
      collections: debugResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

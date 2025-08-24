import FirestoreService from '@/lib/firestore-service';
import { dbAdmin } from '@/lib/firebase-admin';

// Utility function to serialize Firestore data
function serializeFirestoreData(data) {
  const serialized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
      // Convert Firestore Timestamp to ISO string
      serialized[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && value._seconds !== undefined) {
      // Handle Firestore Timestamp objects that might not have toDate method
      serialized[key] = new Date(value._seconds * 1000 + value._nanoseconds / 1000000).toISOString();
    } else {
      serialized[key] = value;
    }
  }
  
  return serialized;
}

export async function GET() {
  try {
    
    // Get all formations without ordering first
    const snapshot = await dbAdmin.collection('formations').get();
    const formations = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const serializedData = serializeFirestoreData(data);
      
      formations.push({
        id: doc.id,
        ...serializedData
      });
    });
    
    // Sort by order field if it exists, otherwise by createdAt
    formations.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.createdAt && b.createdAt) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });
    
    
    return Response.json({ 
      success: true, 
      data: formations,
      count: formations.length,
      message: formations.length === 0 ? 'No formations found in database' : `Found ${formations.length} formations`
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const docRef = await dbAdmin.collection('formations').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return Response.json({ success: true, id: docRef.id });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, ...data } = await request.json();
    await dbAdmin.collection('formations').doc(id).update({
      ...data,
      updatedAt: new Date()
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    await dbAdmin.collection('formations').doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

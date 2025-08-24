import FirestoreService from '@/lib/firestore-service';
import { dbAdmin } from '@/lib/firebase-admin';

export async function GET() {
  try {
    
    // Get all experiences without ordering first
    const snapshot = await dbAdmin.collection('experiences').get();
    const experiences = [];
    
    snapshot.forEach((doc) => {
      experiences.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by order field if it exists, otherwise by createdAt
    experiences.sort((a, b) => {
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
      data: experiences,
      count: experiences.length,
      message: experiences.length === 0 ? 'No experiences found in database' : `Found ${experiences.length} experiences`
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
    
    const docRef = await dbAdmin.collection('experiences').add({
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
    
    await dbAdmin.collection('experiences').doc(id).update({
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
    
    await dbAdmin.collection('experiences').doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

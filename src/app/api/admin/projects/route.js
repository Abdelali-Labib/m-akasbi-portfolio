import FirestoreService from '@/lib/firestore-service';
import { dbAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    
    // Get all projects without ordering first
    const snapshot = await dbAdmin.collection('projects').get();
    const projects = [];
    
    snapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by order field if it exists, otherwise by createdAt
    projects.sort((a, b) => {
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
      data: projects,
      count: projects.length,
      message: projects.length === 0 ? 'No projects found in database' : `Found ${projects.length} projects`
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const docRef = await dbAdmin.collection('projects').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    revalidatePath('/projets');
    return Response.json({ success: true, id: docRef.id });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, ...data } = await request.json();
    await dbAdmin.collection('projects').doc(id).update({
      ...data,
      updatedAt: new Date()
    });
    revalidatePath('/projets');
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
    
    await dbAdmin.collection('projects').doc(id).delete();
    revalidatePath('/projets');
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

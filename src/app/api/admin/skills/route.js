import FirestoreService from '@/lib/firestore-service';
import { dbAdmin } from '@/lib/firebase-admin';
import { isAdmin } from '@/lib/firestore-admin';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const skills = await FirestoreService.getCollection('skills');
    
    return Response.json({ success: true, data: skills });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return Response.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const data = await request.json();
    const docRef = await dbAdmin.collection('skills').add({
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
    // Check authentication
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return Response.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id, ...data } = await request.json();
    await dbAdmin.collection('skills').doc(id).update({
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
    // Check authentication
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return Response.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    await dbAdmin.collection('skills').doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

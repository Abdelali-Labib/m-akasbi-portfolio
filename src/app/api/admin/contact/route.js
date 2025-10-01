import FirestoreService from '@/lib/firestore-service';
import { dbAdmin } from '@/lib/firebase-admin';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contactInfo = await FirestoreService.getContactInfo();
    
    return Response.json({ success: true, data: contactInfo }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    await dbAdmin.collection('contactInfo').add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return Response.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
   
    return Response.json({ success: false, error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    await dbAdmin.collection('contactInfo').doc(id).delete();
    return Response.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
   
    return Response.json({ success: false, error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function PUT(request) {
  try {
    const { id, ...data } = await request.json();
    
    if (!id) {
      return Response.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    await dbAdmin.collection('contactInfo').doc(id).update({
      ...data,
      updatedAt: new Date()
    });
    
    return Response.json({ success: true });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

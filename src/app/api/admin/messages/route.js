import { dbAdmin } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await dbAdmin.collection('messages')
      .orderBy('createdAt', 'desc')
      .get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    return Response.json({ success: true, data: messages });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, ...data } = await request.json();
    await dbAdmin.collection('messages').doc(id).update({
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
    
    await dbAdmin.collection('messages').doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

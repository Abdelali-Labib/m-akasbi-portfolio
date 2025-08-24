import { NextResponse } from 'next/server';
import { dbAdmin as db } from '@/lib/firebase-admin';

/**
 * GET - Fetch all siteContent documents
 */
export async function GET() {
  try {
    const snapshot = await db.collection('siteContent').get();
    const documents = {};
    
    snapshot.forEach(doc => {
      documents[doc.id] = doc.data();
    });

    return NextResponse.json({ documents });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Erreur lors du chargement des documents' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update or create a siteContent document
 */
export async function PUT(request) {
  try {
    const { docId, data } = await request.json();

    if (!docId) {
      return NextResponse.json(
        { error: 'ID du document requis' },
        { status: 400 }
      );
    }

    // Add timestamp
    const documentData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await db.collection('siteContent').doc(docId).set(documentData, { merge: true });

    return NextResponse.json({ 
      message: 'Document sauvegardé avec succès',
      docId,
      data: documentData
    });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a siteContent document
 */
export async function DELETE(request) {
  try {
    const { docId } = await request.json();

    if (!docId) {
      return NextResponse.json(
        { error: 'ID du document requis' },
        { status: 400 }
      );
    }

    await db.collection('siteContent').doc(docId).delete();

    return NextResponse.json({ 
      message: 'Document supprimé avec succès',
      docId
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

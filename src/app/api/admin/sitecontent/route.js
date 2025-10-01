import { NextResponse } from 'next/server';
import { dbAdmin as db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

/**
 * GET: Returns all siteContent documents.
 */
export async function GET() {
  try {
    const snapshot = await db.collection('siteContent').get();
    const documents = {};
    
    snapshot.forEach(doc => {
      documents[doc.id] = doc.data();
    });

    return NextResponse.json({ documents }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Erreur lors du chargement des documents' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

/**
 * PUT: Updates or creates a siteContent document.
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

  // Add/update timestamp for tracking changes
    const documentData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await db.collection('siteContent').doc(docId).set(documentData, { merge: true });
    revalidatePath('/accueil');
    revalidatePath('/contact');
    revalidatePath('/projets');
    revalidatePath('/competences');
    revalidatePath('/experiences');
    revalidatePath('/formations');

    return NextResponse.json({ 
      message: 'Document sauvegardé avec succès',
      docId,
      data: documentData
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

/**
 * DELETE: Removes a siteContent document by ID.
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
    revalidatePath('/accueil');
    revalidatePath('/contact');
    revalidatePath('/projets');
    revalidatePath('/competences');
    revalidatePath('/experiences');
    revalidatePath('/formations');

    return NextResponse.json({ 
      message: 'Document supprimé avec succès',
      docId
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

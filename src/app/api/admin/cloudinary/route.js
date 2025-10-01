import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * GET - Fetch all files from Cloudinary
 */
export async function GET() {
  try {

    // Check if Cloudinary is properly configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { 
          error: 'Configuration Cloudinary manquante',
          details: 'Vérifiez vos variables d\'environnement NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
        },
        { status: 500 }
      );
    }
    
    // Fetch all resource types in parallel
    const [imageResult, videoResult, rawResult] = await Promise.all([
      cloudinary.api.resources({ resource_type: 'image', max_results: 500, type: 'upload' }),
      cloudinary.api.resources({ resource_type: 'video', max_results: 500, type: 'upload' }),
      cloudinary.api.resources({ resource_type: 'raw', max_results: 500, type: 'upload' })
    ]);

    const allResources = [
      ...(imageResult.resources || []),
      ...(videoResult.resources || []),
      ...(rawResult.resources || []),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (allResources.length > 0) {
    }

    return NextResponse.json({ 
      files: allResources,
      total: allResources.length,
      message: `Found ${allResources.length} files`
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du chargement des fichiers',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

/**
 * PATCH - Rename a file in Cloudinary
 */
export async function PATCH(request) {
  try {
    const { public_id, resource_type, new_name } = await request.json();

    if (!public_id || !resource_type || !new_name) {
      return NextResponse.json(
        { error: 'public_id, resource_type et new_name sont requis' },
        { status: 400 }
      );
    }

    // Rename the file using Cloudinary's rename API
    const result = await cloudinary.uploader.rename(
      public_id,
      new_name,
      { resource_type: resource_type }
    );

    return NextResponse.json({
      message: 'Fichier renommé avec succès',
      result: {
        public_id: result.public_id,
        secure_url: result.secure_url
      }
    });

  } catch (error) {
    
    // Handle specific Cloudinary errors
    if (error.message && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Un fichier avec ce nom existe déjà' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors du renommage',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a file from Cloudinary
 */
export async function DELETE(request) {
  try {
    const { resources } = await request.json();

    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return NextResponse.json(
        { error: 'Un tableau de ressources est requis' },
        { status: 400 }
      );
    }

    // Group resources by type
    const resourcesByType = resources.reduce((acc, resource) => {
      const { resource_type, public_id } = resource;
      if (!acc[resource_type]) {
        acc[resource_type] = [];
      }
      acc[resource_type].push(public_id);
      return acc;
    }, {});

    const deletionPromises = Object.entries(resourcesByType).map(([type, publicIds]) => {
      return cloudinary.api.delete_resources(publicIds, { resource_type: type });
    });

    const results = await Promise.all(deletionPromises);

    const allDeletedIds = [];
    const allFailed = {};

    results.forEach(result => {
      if (result.deleted) {
        allDeletedIds.push(...Object.keys(result.deleted));
      }
      if (result.partial && result.deleted_counts) {
        for (const [id, res] of Object.entries(result.deleted_counts)) {
          if (res.error) {
            allFailed[id] = res.error.message;
          }
        }
      }
    });

    if (Object.keys(allFailed).length > 0) {
      return NextResponse.json(
        {
          error: 'Certains fichiers n\'ont pas pu être supprimés.',
          details: { failed: allFailed, deleted: allDeletedIds },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: `${allDeletedIds.length} fichier(s) supprimé(s) avec succès`,
      deletedIds: allDeletedIds,
      results,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

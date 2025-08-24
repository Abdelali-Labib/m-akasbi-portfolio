// lib/FirestoreService.js
import { dbAdmin as db } from './firebase-admin';

class FirestoreService {
  /**
   * Serialize Firestore data to make it safe for Client Components
   * Converts Firestore timestamps to plain objects
   * @param {any} data - The data to serialize
   * @returns {any} Serialized data safe for Client Components
   */
  static serializeFirestoreData(data) {
    if (data === null || data === undefined) {
      return data;
    }
    
    // Handle Firestore timestamps - only pass serializable values
    if (data && typeof data === 'object' && data._seconds !== undefined && data._nanoseconds !== undefined) {
      return {
        _seconds: data._seconds,
        _nanoseconds: data._nanoseconds
      };
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.serializeFirestoreData(item));
    }
    
    // Handle objects
    if (typeof data === 'object') {
      const serialized = {};
      for (const [key, value] of Object.entries(data)) {
        serialized[key] = this.serializeFirestoreData(value);
      }
      return serialized;
    }
    
    // Return primitives as-is
    return data;
  }

  /**
   * Fix Cloudinary URLs to ensure proper formatting
   * @param {string} url - The URL to fix
   * @returns {string} Fixed Cloudinary URL
   */
  static fixCloudinaryUrl(url) {
    if (!url || typeof url !== 'string') return url;
    
    // If it's already a full Cloudinary URL, return as is
    if (url.startsWith('https://res.cloudinary.com/')) {
      return url;
    }
    
    // Get cloud name from environment
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return url;
    }
    
    // If it's just a filename, construct the full URL
    const formattedPath = url.startsWith('/') ? url : `/${url}`;
    return `https://res.cloudinary.com/${cloudName}/image/upload${formattedPath}`;
  }

  /**
   * Generic method to fetch documents from a collection with options
   * @param {string} collectionName - Name of the Firestore collection
   * @param {Object} options - Query options like where, orderBy, limit
   * @returns {Promise<Array>} Array of documents
   */
  static async getCollection(collectionName, options = {}) {
    try {
      let queryRef = db.collection(collectionName);

      if (options.where) {
        queryRef = queryRef.where(options.where.field, options.where.operator, options.where.value);
      }
      
      // Apply orderBy directly - let Firestore handle missing fields
      if (options.orderBy) {
        try {
          queryRef = queryRef.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
        } catch (orderError) {
          // Continue without ordering
        }
      }
      
      if (options.limit) {
        queryRef = queryRef.limit(options.limit);
      }

      const snapshot = await queryRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...this.serializeFirestoreData(doc.data())
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch and categorize skills data
   */
  static async getSkills() {
    const skills = await this.getCollection('skills');

    // Fix Cloudinary URLs for skills icons
    const fixedSkills = skills.map(skill => ({
      ...skill,
      icon: skill.icon ? this.fixCloudinaryUrl(skill.icon) : skill.icon
    }));

    // Categorize skills by category field
    const technical = fixedSkills.filter(s => s.category === 'technical');
    const comprehensive = fixedSkills.filter(s => s.category === 'comprehensive');
    const languages = fixedSkills.filter(s => s.category === 'language');

    return [
      {
        name: "Outils Techniques",
        description: "Maîtrise des logiciels et des plateformes de création de contenu.",
        data: technical,
      },
      {
        name: "Compétences Générales",
        description: "Expertise en production audiovisuelle et en gestion de projet.",
        data: comprehensive,
      },
      {
        name: "Langues",
        description: "Maîtrise des langues pour une communication internationale.",
        data: languages,
      }
    ];
  }

  /**
   * Fetch and categorize experiences data
   */
  static async getExperiences() {
    const experiences = await this.getCollection('experiences');

    const workExperiences = experiences.filter(exp => exp.type === 'Work');
    const filmExperiences = experiences.filter(exp => exp.type === 'Film');

    return { workExperiences, filmExperiences };
  }

  /**
   * Fetch and categorize projects data
   */
  static async getProjects() {
    const projects = await this.getCollection('projects');

    // Fix URLs based on project type
    const fixedProjects = projects.map(project => {
      if (project.type === 'video' || project.type === 'playlist') {
        // For videos and playlists, keep thumbnails as is (YouTube thumbnails)
        return {
          ...project,
          // Don't modify video/playlist thumbnails - they come from YouTube/video platforms
        };
      } else if (project.type === 'image') {
        // For images, fix Cloudinary URLs
        return {
          ...project,
          img: project.img ? this.fixCloudinaryUrl(project.img) : project.img,
          thumbnail: project.thumbnail ? this.fixCloudinaryUrl(project.thumbnail) : project.thumbnail
        };
      } else {
        // For other types, return as is
        return project;
      }
    });

    // Categorize projects by type
    const videos = fixedProjects.filter(project => project.type === 'video');
    const playlists = fixedProjects.filter(project => project.type === 'playlist');
    const images = fixedProjects.filter(project => project.type === 'image');

    return { videos, playlists, images };
  }

  /**
   * Fetch formations data
   */
  static async getFormations() {
    return await this.getCollection('formations', {
      orderBy: { field: 'year', direction: 'desc' }
    });
  }

  /**
   * Fetch profile information including profile picture
   */
  static async getProfileInfo() {
    try {
      const profileDoc = await db.collection('siteContent').doc('profile').get();
      return profileDoc.exists ? this.serializeFirestoreData(profileDoc.data()) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch all documents that constitute the home page data
   */
  static async getHomeData() {
    try {
      const [homeDoc, statsDoc, socialDoc] = await Promise.all([
        db.collection('siteContent').doc('home').get(),
        db.collection('siteContent').doc('statistics').get(),
        db.collection('siteContent').doc('socialMedia').get()
      ]);
      
      // Extract statistics array from the nested structure { items: [...] }
      let statistics = [];
      if (statsDoc.exists) {
        const statsData = this.serializeFirestoreData(statsDoc.data());
        
        // Check if statistics is in the 'items' field (as per migration script)
        if (statsData && Array.isArray(statsData.items)) {
          statistics = statsData.items;
        }
        // Check if statistics is directly an array
        else if (Array.isArray(statsData)) {
          statistics = statsData;
        }
        // Check if statistics is in a 'data' field
        else if (statsData && Array.isArray(statsData.data)) {
          statistics = statsData.data;
        }
        // Check if statistics is in a 'statistics' field
        else if (statsData && Array.isArray(statsData.statistics)) {
          statistics = statsData.statistics;
        }
        // If none of the above, try to find any array field
        else {
          const arrayFields = Object.values(statsData).filter(value => Array.isArray(value));
          if (arrayFields.length > 0) {
            statistics = arrayFields[0];
          }
        }
      }
      
      // Extract social media from the nested structure { links: {...} }
      let socialMedia = null;
      if (socialDoc.exists) {
        const socialData = this.serializeFirestoreData(socialDoc.data());
        
        // Check if social media is in the 'links' field (as per migration script)
        if (socialData && socialData.links) {
          socialMedia = socialData.links;
        }
        // Check if social media is directly the document data
        else if (socialData) {
          socialMedia = socialData;
        }
      }
      
      return {
        content: homeDoc.exists ? this.serializeFirestoreData(homeDoc.data()) : null,
        statistics: this.serializeFirestoreData(statistics),
        socialMedia: this.serializeFirestoreData(socialMedia)
      };
    } catch (error) {
      return { content: null, statistics: [], socialMedia: null };
    }
  }

  /**
   * Fetch contact information
   */
  static async getContactInfo() {
    return await this.getCollection('contactInfo');
  }

  /**
   * Fetch the CV path from Firestore.
   * The path is expected to be in siteContent/CV document.
   * @returns {Promise<string|null>} The path to the CV or null if not found.
   */
  static async getCvPath() {
    try {
      const cvDoc = await db.collection('siteContent').doc('CV').get();
      if (cvDoc.exists) {
        const data = cvDoc.data();
        // Assuming the field is named cv_path as per user request
        return data.cv_path || null; 
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get static content for different sections (fallback to hardcoded content)
   * This method provides fallback content when Firestore is not available
   */
  static async getStaticContent(section = 'home') {
    // Import the static data files
    try {
      switch (section) {
        case 'home':
          return {
            badge: "Art & visuel • Créateur de contenu",
            greeting: "Bonjour, je suis",
            name: "Mouhcine AKASBI",
            downloadCv: "Télécharger CV",
            viewProjects: "Voir mes projets",
            followMe: "Suivez-moi sur"
          };
        case 'projects':
          return {
            hero: {
              title: "Mes",
              accentWord: "Projets",
              description: "Une collection de projets créatifs et techniques qui démontrent mes compétences en développement, design et création de contenu multimédia."
            },
            sections: {
              videos: {
                title: "Projets",
                accentWord: "Vidéo",
                description: "Découvrez mes créations vidéo et mes compétences en montage et production multimédia."
              },
              playlists: {
                title: "",
                accentWord: "Playlists",
                suffix: "& Collections",
                description: "Explorez mes collections organisées et mes playlists thématiques."
              },
              images: {
                title: "Projets",
                accentWord: "Créatifs",
                description: "Admirez mes créations graphiques et mes compétences en design et retouche d'images."
              }
            }
          };
        case 'skills':
          return {
            title: "Mes Compétences",
            description: "Un aperçu de mes compétences techniques et créatives"
          };
        case 'experiences':
          return {
            title: "Mon Expérience",
            description: "Mon parcours professionnel et mes réalisations"
          };
        case 'formations':
          return {
            title: "Ma Formation",
            description: "Mon parcours académique et mes certifications"
          };
        case 'contact':
          return {
            title: "Contactez-moi",
            description: "N'hésitez pas à me contacter pour toute collaboration"
          };
        default:
          return {};
      }
    } catch (error) {
      return {};
    }
  }

  /**
   * Debug method to test all collections and see what's available
   */
  static async debugCollections() {
    try {
      const collections = ['skills', 'experiences', 'projects', 'formations', 'contactInfo', 'siteContent'];
      const results = {};
      
      for (const collectionName of collections) {
        try {
          const snapshot = await db.collection(collectionName).get();
          results[collectionName] = {
            exists: true,
            documentCount: snapshot.size,
            sampleDoc: snapshot.empty ? null : this.serializeFirestoreData(snapshot.docs[0].data())
          };
        } catch (error) {
          results[collectionName] = {
            exists: false,
            error: error.message
          };
        }
      }
      
      return results;
    } catch (error) {
      return {};
    }
  }
}

export default FirestoreService;
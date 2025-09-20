// ...existing code...
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { UAParser } from 'ua-parser-js';

class FirestoreService {
  /**
   * Recursively serializes Firestore data for safe use in client components.
   * Converts Firestore timestamps to plain objects.
   * @param {any} data - Data to serialize
   * @returns {any} Serialized data
   */
  static serializeFirestoreData(data) {
    if (data === null || data === undefined) {
      return data;
    }
    
  // ...existing code...
    if (data && typeof data === 'object' && data._seconds !== undefined && data._nanoseconds !== undefined) {
      return {
        _seconds: data._seconds,
        _nanoseconds: data._nanoseconds
      };
    }
    
  // ...existing code...
    if (Array.isArray(data)) {
      return data.map(item => this.serializeFirestoreData(item));
    }
    
  // ...existing code...
    if (typeof data === 'object') {
      const serialized = {};
      for (const [key, value] of Object.entries(data)) {
        serialized[key] = this.serializeFirestoreData(value);
      }
      return serialized;
    }
    
  // ...existing code...
    return data;
  }

  /**
   * Returns a properly formatted Cloudinary image URL for a given path or URL.
   * @param {string} url - Image path or URL
   * @returns {string} Cloudinary image URL
   */
  static fixCloudinaryUrl(url) {
    if (!url || typeof url !== 'string') return url;
    
  // ...existing code...
    if (url.startsWith('https://res.cloudinary.com/')) {
      return url;
    }
    
  // ...existing code...
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return url;
    }
    
  // ...existing code...
    const formattedPath = url.startsWith('/') ? url : `/${url}`;
    return `https://res.cloudinary.com/${cloudName}/image/upload${formattedPath}`;
  }

  /**
   * Fetches documents from a Firestore collection with optional query constraints.
   * @param {string} collectionName - Firestore collection name
   * @param {Object} options - Query options: where, orderBy, limit
   * @returns {Promise<Array>} Array of documents
   */
  static async getCollection(collectionName, options = {}) {
    try {
      let queryRef = collection(db, collectionName);
      const queryConstraints = [];

      if (options.where) {
        queryConstraints.push(where(options.where.field, options.where.operator, options.where.value));
      }
      
  // ...existing code...
      if (options.orderBy) {
        try {
          queryConstraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
        } catch (orderError) {
          // ...existing code...
        }
      }
      
      if (options.limit) {
        queryConstraints.push(limit(options.limit));
      }

      const q = queryConstraints.length > 0 ? query(queryRef, ...queryConstraints) : queryRef;
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...this.serializeFirestoreData(docSnap.data())
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Adds a new skill document to Firestore.
   * @param {Object} skillData - Skill data
   * @returns {Promise<string>} Created skill ID
   */
  static async addSkill(skillData) {
    try {
      const docRef = await addDoc(collection(db, 'skills'), skillData);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates an existing skill document in Firestore.
   * @param {string} skillId - Skill ID
   * @param {Object} skillData - Updated skill data
   * @returns {Promise<void>}
   */
  static async updateSkill(skillId, skillData) {
    try {
      const skillRef = doc(db, 'skills', skillId);
      await updateDoc(skillRef, skillData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a skill document from Firestore.
   * @param {string} skillId - Skill ID
   * @returns {Promise<void>}
   */
  static async deleteSkill(skillId) {
    try {
      const skillRef = doc(db, 'skills', skillId);
      await deleteDoc(skillRef);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch and categorize skills data
   */
  static async getSkills() {
    const skills = await this.getCollection('skills');

  // ...existing code...
    const fixedSkills = skills.map(skill => ({
      ...skill,
      icon: skill.icon ? this.fixCloudinaryUrl(skill.icon) : skill.icon
    }));

  // ...existing code...
    const groupedSkills = {};
    fixedSkills.forEach(skill => {
      if (!groupedSkills[skill.category]) {
        groupedSkills[skill.category] = [];
      }
      groupedSkills[skill.category].push(skill);
    });

  // ...existing code...
    Object.keys(groupedSkills).forEach(category => {
      groupedSkills[category].sort((a, b) => (b.percentage || b.level || 0) - (a.percentage || a.level || 0));
    });

  // ...existing code...
    const technical = groupedSkills['technical'] || [];
    const comprehensive = groupedSkills['comprehensive'] || [];
    const languages = groupedSkills['language'] || [];

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
    const experiences = await this.getCollection('experiences', {
      orderBy: { field: 'startYear', direction: 'desc' }
    });

    const workExperiences = experiences.filter(exp => exp.type === 'work');
    const filmExperiences = experiences.filter(exp => exp.type === 'film');

    return { workExperiences, filmExperiences };
  }

  /**
   * Fetch and categorize projects data
   */
  static async getProjects() {
    const projects = await this.getCollection('projects');

  // ...existing code...
    const fixedProjects = projects.map(project => {
      if (project.type === 'video' || project.type === 'playlist') {
  // ...existing code...
        return {
          ...project,
          // ...existing code...
        };
      } else if (project.type === 'image') {
  // ...existing code...
        return {
          ...project,
          img: project.img ? this.fixCloudinaryUrl(project.img) : project.img,
          thumbnail: project.thumbnail ? this.fixCloudinaryUrl(project.thumbnail) : project.thumbnail
        };
      } else {
  // ...existing code...
        return project;
      }
    });

  // ...existing code...
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
   * Fetch all documents that constitute the home page data
   * Updated to match new SiteContent structure
   */
  static async getHomeData() {
    try {
      const [homeDoc, profileDoc, socialDoc, statsDoc] = await Promise.all([
        getDoc(doc(db, 'siteContent', 'home')),
        getDoc(doc(db, 'siteContent', 'profile_picture')),
        getDoc(doc(db, 'siteContent', 'socialMedia')),
        getDoc(doc(db, 'siteContent', 'statistics'))
      ]);
      
  // ...existing code...
      const homeContent = homeDoc.exists() ? this.serializeFirestoreData(homeDoc.data()) : {
        description: "Passionné d'audiovisuel, je réalise et expérimente divers projets vidéo. Curieux et adaptable, j'apporte une perspective innovante et m'implique pleinement dans de nouveaux défis. Prêt à collaborer, je cherche à développer mes compétences et à créer des contenus visuels captivants qui inspirent et engagent.",
        subtitle: "Passionné d'audiovisuel & créateur digital"
      };

  // ...existing code...
      const profileInfo = profileDoc.exists() ? this.serializeFirestoreData(profileDoc.data()) : null;

  // ...existing code...
      let statistics = [];
      if (statsDoc.exists()) {
        const statsData = this.serializeFirestoreData(statsDoc.data());
        if (statsData && Array.isArray(statsData.items)) {
          statistics = statsData.items;
        }
      }
      
  // ...existing code...
      let socialMedia = null;
      if (socialDoc.exists()) {
        const socialData = this.serializeFirestoreData(socialDoc.data());
        if (socialData && socialData.links) {
          socialMedia = socialData.links;
        }
      }
      
      return {
        content: homeContent,
        statistics: this.serializeFirestoreData(statistics),
        socialMedia: this.serializeFirestoreData(socialMedia),
        profileInfo: profileInfo
      };
    } catch (error) {
      return { 
        content: {
          description: "Passionné d'audiovisuel, je réalise et expérimente divers projets vidéo. Curieux et adaptable, j'apporte une perspective innovante et m'implique pleinement dans de nouveaux défis. Prêt à collaborer, je cherche à développer mes compétences et à créer des contenus visuels captivants qui inspirent et engagent.",
          subtitle: "Passionné d'audiovisuel & créateur digital"
        },
        statistics: [], 
        socialMedia: null,
        profileInfo: null
      };
    }
  }

  /**
   * Fetch profile information including profile picture
   * Updated to match new structure
   */
  static async getProfileInfo() {
    try {
      const profileDoc = await getDoc(doc(db, 'siteContent', 'profile_picture'));
      return profileDoc.exists() ? this.serializeFirestoreData(profileDoc.data()) : null;
    } catch (error) {
      return null;
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
      const cvDoc = await getDoc(doc(db, 'siteContent', 'CV'));
      if (cvDoc.exists()) {
        const data = cvDoc.data();
  // ...existing code...
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
  // ...existing code...
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
   * Track visitor analytics (no page view data)
   * @param {Object} visitorData - Visitor tracking data
   */
  static async trackVisitor(visitorData) {
    try {
      const { visitorId, date, country, userAgent, referrer, timestamp } = visitorData;
      
      // Parse user agent for device info only
      const parser = new UAParser(userAgent || '');
      const deviceResult = parser.getDevice();
      let device = deviceResult.type;

      // If device type is not directly identified, infer from OS or UA string
      if (!device) {
        const os = parser.getOS().name;
        const ua = (userAgent || '').toLowerCase();
        if (os === 'Android' || os === 'iOS') {
          device = 'mobile';
        } else if (ua.includes('mobile')) {
          device = 'mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          device = 'tablet';
        } else {
          device = 'desktop'; // Default fallback
        }
      }
      // Server-side (admin SDK) aggregation when available
      if (typeof window === 'undefined') {
        try {
          const { dbAdmin } = await import('./firebase-admin');
          if (dbAdmin) {
            const docRef = dbAdmin.collection('analytics').doc('daily_stats');
            const snap = await docRef.get();
            const current = snap.exists ? snap.data() : {};

            const next = { ...current };
            next.updated_at = timestamp || new Date();
            next.daily_visitors = { ...(current.daily_visitors || {}) };
            next.visitor_countries = { ...(current.visitor_countries || {}) };
            next.visitor_devices = { ...(current.visitor_devices || {}) };
            next.visitor_referrers = { ...(current.visitor_referrers || {}) };

            // Increment counters only (do not store visitor IDs)
            const currentCountAdmin = typeof next.daily_visitors[date] === 'number'
              ? next.daily_visitors[date]
              : (Array.isArray(next.daily_visitors[date]) ? next.daily_visitors[date].length : 0);
            next.daily_visitors[date] = currentCountAdmin + 1;

            next.visitor_countries[country || 'Unknown'] = (next.visitor_countries[country || 'Unknown'] || 0) + 1;
            next.visitor_devices[device] = (next.visitor_devices[device] || 0) + 1;
            next.visitor_referrers[referrer || 'Direct'] = (next.visitor_referrers[referrer || 'Direct'] || 0) + 1;

            await docRef.set(next, { merge: true });
            return;
          }
        } catch (_) {
          // fallback to client SDK below
        }
      }

      // Client-side fallback using web SDK
      {
        const aggRef = doc(db, 'analytics', 'daily_stats');
        const aggSnap = await getDoc(aggRef);
        const current = aggSnap.exists() ? aggSnap.data() : {};
        const next = { ...current };
        next.updated_at = timestamp || new Date();
        next.daily_visitors = { ...(current.daily_visitors || {}) };
        next.visitor_countries = { ...(current.visitor_countries || {}) };
        next.visitor_devices = { ...(current.visitor_devices || {}) };
        next.visitor_referrers = { ...(current.visitor_referrers || {}) };

        const currentCount = typeof next.daily_visitors[date] === 'number'
          ? next.daily_visitors[date]
          : (Array.isArray(next.daily_visitors[date]) ? next.daily_visitors[date].length : 0);
        next.daily_visitors[date] = currentCount + 1;

        next.visitor_countries[country || 'Unknown'] = (next.visitor_countries[country || 'Unknown'] || 0) + 1;
        next.visitor_devices[device] = (next.visitor_devices[device] || 0) + 1;
        next.visitor_referrers[referrer || 'Direct'] = (next.visitor_referrers[referrer || 'Direct'] || 0) + 1;

        await setDoc(aggRef, next, { merge: true });
      }

    } catch (error) {
      // ...existing code...
    }
  }
  /**
   * Track CV download with date-based analytics
   * @param {Object} downloadData - Download tracking data
   */
  static async trackCvDownload(downloadData) {
    try {
      const { date, userAgent, country, timestamp } = downloadData;

  // ...existing code...
      if (typeof window === 'undefined') {
        try {
          const { dbAdmin } = await import('./firebase-admin');
          if (dbAdmin) {
            // ...existing code...
            const docRef = dbAdmin.collection('analytics').doc('daily_stats');
            const snap = await docRef.get();
            const current = snap.exists ? snap.data() : {};

            const next = { ...current };
            next.updated_at = timestamp || new Date();
            next.cv_downloads_by_date = { ...(current.cv_downloads_by_date || {}) };
            next.cv_downloads_by_date[date] = (next.cv_downloads_by_date[date] || 0) + 1;

            await docRef.set(next, { merge: true });
            return;
          }
        } catch (_) {
          // ...existing code...
        }
      }

      {
  // ...existing code...
        const aggRef = doc(db, 'analytics', 'daily_stats');
        const aggSnap = await getDoc(aggRef);
        const current = aggSnap.exists() ? aggSnap.data() : {};
        const next = { ...current };
        next.updated_at = timestamp || new Date();
        next.cv_downloads_by_date = { ...(current.cv_downloads_by_date || {}) };
        next.cv_downloads_by_date[date] = (next.cv_downloads_by_date[date] || 0) + 1;

        await setDoc(aggRef, next, { merge: true });
      }

    } catch (error) {
  // ...existing code...
    }
  }

  /**
   * Fetch and process analytics data from Firestore
   * @returns {Promise<Object>} Processed analytics data
   */
  static async getAnalyticsData() {
    try {
      const analyticsDoc = await getDoc(doc(db, 'analytics', 'daily_stats'));
      
      if (!analyticsDoc.exists()) {
        return {
          totalVisitors: 0,
          cvDownloads: 0,
          visitorsByDay: [],
          cvDownloadsByDay: [],
          topCountries: [],
          devices: [],
          topReferrers: []
        };
      }

      const data = this.serializeFirestoreData(analyticsDoc.data());
      
      // Calculate total visitors and visitors by day from the daily_visitors map
      const dailyVisitorsMap = data.daily_visitors || {};
      const totalVisitors = Object.values(dailyVisitorsMap).reduce((sum, value) => {
        if (Array.isArray(value)) return sum + value.length; // backward compatibility
        const n = Number(value || 0);
        return sum + (isNaN(n) ? 0 : n);
      }, 0);

      const visitorsByDay = Object.entries(dailyVisitorsMap).map(([date, value]) => ({
        date,
        visitors: Array.isArray(value) ? value.length : (Number(value || 0) || 0),
      }));

      // Calculate CV downloads total from cv_downloads_by_date
      const cvDownloads = Object.values(data.cv_downloads_by_date || {}).reduce((sum, count) => sum + (count || 0), 0);

      // Process CV downloads by day
      const cvDownloadsByDate = data.cv_downloads_by_date || {};
      const cvDownloadsByDay = [];
      
      for (const [date, downloads] of Object.entries(cvDownloadsByDate)) {
        if (typeof downloads === 'number') {
          cvDownloadsByDay.push({
            date,
            downloads: downloads
          });
        }
      }

      // Process visitor countries data
      let topCountries = [];
      if (data.visitor_countries) {
        topCountries = Object.entries(data.visitor_countries)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      // Process visitor devices data
      let devices = [];
      if (data.visitor_devices) {
        devices = Object.entries(data.visitor_devices)
          .map(([device, count]) => ({ device, count }))
          .sort((a, b) => b.count - a.count);
      }

      // Process visitor referrers data
      let topReferrers = [];
      if (data.visitor_referrers) {
        topReferrers = Object.entries(data.visitor_referrers)
          .map(([referrer, count]) => ({ referrer, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      // Sort by date for charting (most recent first)
      visitorsByDay.sort((a, b) => new Date(b.date) - new Date(a.date));
      cvDownloadsByDay.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        totalVisitors,
        cvDownloads,
        visitorsByDay: visitorsByDay.slice(0, 30),
        cvDownloadsByDay: cvDownloadsByDay.slice(0, 30),
        topCountries,
        devices,
        topReferrers
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return {
        totalVisitors: 0,
        cvDownloads: 0,
        visitorsByDay: [],
        cvDownloadsByDay: [],
        topCountries: [],
        devices: [],
        topReferrers: []
      };
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
          const snapshot = await getDocs(collection(db, collectionName));
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

export { FirestoreService };
export default FirestoreService;
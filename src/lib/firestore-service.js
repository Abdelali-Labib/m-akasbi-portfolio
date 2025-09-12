// lib/FirestoreService.js
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
      let queryRef = collection(db, collectionName);
      const queryConstraints = [];

      if (options.where) {
        queryConstraints.push(where(options.where.field, options.where.operator, options.where.value));
      }
      
      // Apply orderBy directly - let Firestore handle missing fields
      if (options.orderBy) {
        try {
          queryConstraints.push(orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
        } catch (orderError) {
          // Continue without ordering
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
   * Add a new skill to Firestore
   * @param {Object} skillData - The skill data to add
   * @returns {Promise<string>} The ID of the created skill
   */
  static async addSkill(skillData) {
    try {
      const docRef = await addDoc(collection(db, 'skills'), skillData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  }

  /**
   * Update an existing skill in Firestore
   * @param {string} skillId - The ID of the skill to update
   * @param {Object} skillData - The updated skill data
   * @returns {Promise<void>}
   */
  static async updateSkill(skillId, skillData) {
    try {
      const skillRef = doc(db, 'skills', skillId);
      await updateDoc(skillRef, skillData);
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  }

  /**
   * Delete a skill from Firestore
   * @param {string} skillId - The ID of the skill to delete
   * @returns {Promise<void>}
   */
  static async deleteSkill(skillId) {
    try {
      const skillRef = doc(db, 'skills', skillId);
      await deleteDoc(skillRef);
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
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

    // Group skills by category
    const groupedSkills = {};
    fixedSkills.forEach(skill => {
      if (!groupedSkills[skill.category]) {
        groupedSkills[skill.category] = [];
      }
      groupedSkills[skill.category].push(skill);
    });

    // Sort skills within each category by percentage (highest first)
    Object.keys(groupedSkills).forEach(category => {
      groupedSkills[category].sort((a, b) => (b.percentage || b.level || 0) - (a.percentage || a.level || 0));
    });

    // Categorize skills by category field
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
      
      // Extract home content (description, subtitle)
      const homeContent = homeDoc.exists() ? this.serializeFirestoreData(homeDoc.data()) : {
        description: "Passionné d'audiovisuel, je réalise et expérimente divers projets vidéo. Curieux et adaptable, j'apporte une perspective innovante et m'implique pleinement dans de nouveaux défis. Prêt à collaborer, je cherche à développer mes compétences et à créer des contenus visuels captivants qui inspirent et engagent.",
        subtitle: "Passionné d'audiovisuel & créateur digital"
      };

      // Extract profile picture
      const profileInfo = profileDoc.exists() ? this.serializeFirestoreData(profileDoc.data()) : null;

      // Extract statistics array from items field
      let statistics = [];
      if (statsDoc.exists()) {
        const statsData = this.serializeFirestoreData(statsDoc.data());
        if (statsData && Array.isArray(statsData.items)) {
          statistics = statsData.items;
        }
      }
      
      // Extract social media links
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
   * Track pageview with visitor analytics
   * @param {Object} pageviewData - Pageview tracking data
   */
  static async trackPageview(pageviewData) {
    try {
      const { visitorId, date, country, userAgent, referrer, timestamp } = pageviewData;
      
      // Parse user agent for device and browser info
      const parser = new UAParser(userAgent || '');
      const device = parser.getDevice().type || 'desktop';
      const browser = parser.getBrowser().name || 'Unknown';

      // Prefer server-side Admin SDK when available (API routes)
      if (typeof window === 'undefined') {
        try {
          const { dbAdmin } = await import('./firebase-admin');
          if (dbAdmin) {
            // Update aggregate document
            const docRef = dbAdmin.collection('analytics').doc('daily_stats');
            const snap = await docRef.get();
            const current = snap.exists ? snap.data() : {};

            const next = { ...current };
            next.updated_at = timestamp || new Date();
            next.countries = { ...(current.countries || {}) };
            next.devices = { ...(current.devices || {}) };
            next.referrers = { ...(current.referrers || {}) };
            next.browsers = { ...(current.browsers || {}) };
            next.daily_visitors = { ...(current.daily_visitors || {}) };

            next.countries[country || 'Unknown'] = (next.countries[country || 'Unknown'] || 0) + 1;
            next.devices[device] = (next.devices[device] || 0) + 1;
            next.referrers[referrer || 'Direct'] = (next.referrers[referrer || 'Direct'] || 0) + 1;
            next.browsers[browser] = (next.browsers[browser] || 0) + 1;

            const dayVisitors = Array.isArray(next.daily_visitors[date]) ? next.daily_visitors[date] : [];
            if (!dayVisitors.includes(visitorId)) {
              dayVisitors.push(visitorId);
            }
            next.daily_visitors[date] = dayVisitors;

            await docRef.set(next, { merge: true });

            // Optionally also store raw pageview
            await dbAdmin
              .collection('analytics')
              .doc('daily_stats')
              .collection('pageviews')
              .add({
                visitorId,
                date,
                country,
                device,
                browser,
                referrer: referrer || 'direct',
                timestamp
              });
            return;
          }
        } catch (_) {
          // fall through to client SDK
        }
      }

      {
        // Fallback to client SDK: update aggregate doc then add raw pageview
        const aggRef = doc(db, 'analytics', 'daily_stats');
        const aggSnap = await getDoc(aggRef);
        const current = aggSnap.exists() ? aggSnap.data() : {};
        const next = { ...current };
        next.updated_at = timestamp || new Date();
        next.countries = { ...(current.countries || {}) };
        next.devices = { ...(current.devices || {}) };
        next.referrers = { ...(current.referrers || {}) };
        next.browsers = { ...(current.browsers || {}) };
        next.daily_visitors = { ...(current.daily_visitors || {}) };

        next.countries[country || 'Unknown'] = (next.countries[country || 'Unknown'] || 0) + 1;
        next.devices[device] = (next.devices[device] || 0) + 1;
        next.referrers[referrer || 'Direct'] = (next.referrers[referrer || 'Direct'] || 0) + 1;
        next.browsers[browser] = (next.browsers[browser] || 0) + 1;

        const dayVisitors = Array.isArray(next.daily_visitors[date]) ? next.daily_visitors[date] : [];
        if (!dayVisitors.includes(visitorId)) {
          dayVisitors.push(visitorId);
        }
        next.daily_visitors[date] = dayVisitors;

        await setDoc(aggRef, next, { merge: true });

      const pageviewsRef = collection(db, 'analytics', 'daily_stats', 'pageviews');
      await addDoc(pageviewsRef, {
        visitorId,
        date,
        country,
        device,
        browser,
        referrer: referrer || 'direct',
        timestamp
      });
      }

    } catch (error) {
      console.error('Error tracking pageview:', error);
      // Don't rethrow the error to the client, just log it
    }
  }

  /**
   * Track CV download with date-based analytics
   * @param {Object} downloadData - Download tracking data
   */
  static async trackCvDownload(downloadData) {
    try {
      const { date, userAgent, country, timestamp } = downloadData;
      
      // Parse user agent for device and browser info
      const parser = new UAParser(userAgent || '');
      const device = parser.getDevice().type || 'desktop';
      const browser = parser.getBrowser().name || 'Unknown';

      // Prefer server-side Admin SDK when available (API routes)
      if (typeof window === 'undefined') {
        try {
          const { dbAdmin } = await import('./firebase-admin');
          if (dbAdmin) {
            // Update aggregate document
            const docRef = dbAdmin.collection('analytics').doc('daily_stats');
            const snap = await docRef.get();
            const current = snap.exists ? snap.data() : {};

            const next = { ...current };
            next.updated_at = timestamp || new Date();
            next.countries = { ...(current.countries || {}) };
            next.devices = { ...(current.devices || {}) };
            next.browsers = { ...(current.browsers || {}) };
            next.cv_downloads_total = (current.cv_downloads_total || 0) + 1;
            next.cv_downloads_by_date = { ...(current.cv_downloads_by_date || {}) };
            next.cv_downloads_by_date[date] = (next.cv_downloads_by_date[date] || 0) + 1;

            next.countries[country || 'Unknown'] = (next.countries[country || 'Unknown'] || 0) + 1;
            next.devices[device] = (next.devices[device] || 0) + 1;
            next.browsers[browser] = (next.browsers[browser] || 0) + 1;

            await docRef.set(next, { merge: true });

            await dbAdmin
              .collection('analytics')
              .doc('daily_stats')
              .collection('cv_downloads')
              .add({
                date,
                country,
                device,
                browser,
                timestamp
              });
            return;
          }
        } catch (_) {
          // fall through to client SDK
        }
      }

      {
        // Fallback to client SDK: update aggregate doc then add raw download
        const aggRef = doc(db, 'analytics', 'daily_stats');
        const aggSnap = await getDoc(aggRef);
        const current = aggSnap.exists() ? aggSnap.data() : {};
        const next = { ...current };
        next.updated_at = timestamp || new Date();
        next.countries = { ...(current.countries || {}) };
        next.devices = { ...(current.devices || {}) };
        next.browsers = { ...(current.browsers || {}) };
        next.cv_downloads_total = (current.cv_downloads_total || 0) + 1;
        next.cv_downloads_by_date = { ...(current.cv_downloads_by_date || {}) };
        next.cv_downloads_by_date[date] = (next.cv_downloads_by_date[date] || 0) + 1;

        next.countries[country || 'Unknown'] = (next.countries[country || 'Unknown'] || 0) + 1;
        next.devices[device] = (next.devices[device] || 0) + 1;
        next.browsers[browser] = (next.browsers[browser] || 0) + 1;

        await setDoc(aggRef, next, { merge: true });

      const downloadsRef = collection(db, 'analytics', 'daily_stats', 'cv_downloads');
      await addDoc(downloadsRef, {
        date,
        country,
        device,
        browser,
        timestamp
      });
      }

    } catch (error) {
      console.error('Error tracking CV download:', error);
      // Don't rethrow the error to the client, just log it
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
          topReferrers: [],
          browsers: []
        };
      }

      const data = this.serializeFirestoreData(analyticsDoc.data());
      
      // Calculate total visitors from daily_visitors map
      let totalVisitors = 0;
      const visitorsByDay = [];
      if (data.daily_visitors) {
        for (const [date, visitors] of Object.entries(data.daily_visitors)) {
          const uniqueVisitors = Array.isArray(visitors) ? visitors.length : 0;
          totalVisitors += uniqueVisitors;
          visitorsByDay.push({
            date,
            visitors: uniqueVisitors
          });
        }
      }

      // Remove page views tracking - focus on unique visitors only

      // Get CV downloads
      const cvDownloads = data.cv_downloads_total || 0;

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

      // Process countries data
      let topCountries = [];
      if (data.countries) {
        topCountries = Object.entries(data.countries)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      // Process devices data
      let devices = [];
      if (data.devices) {
        devices = Object.entries(data.devices)
          .map(([device, count]) => ({ device, count }))
          .sort((a, b) => b.count - a.count);
      }

      // Process referrers data
      let topReferrers = [];
      if (data.referrers) {
        topReferrers = Object.entries(data.referrers)
          .map(([referrer, count]) => ({ referrer, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      // Process browsers data
      let browsers = [];
      if (data.browsers) {
        browsers = Object.entries(data.browsers)
          .map(([browser, count]) => ({ browser, count }))
          .sort((a, b) => b.count - a.count);
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
        topReferrers,
        browsers
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
        topReferrers: [],
        browsers: []
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
/**
 * ONE-TIME MIGRATION SCRIPT
 * --------------------------
 * This script migrates data from your local JavaScript files (`/src/Data`)
 * to your Firestore database. It's designed to be run once to populate the initial data.
 *
 * --- PRE-REQUISITES ---
 * 1. Ensure `firebase-admin` and `dotenv` are installed: `npm install firebase-admin dotenv`
 * 2. Ensure your `.env.local` file is correctly set up with your Firebase service account credentials.
 *
 * --- HOW TO RUN ---
 * From your project root, run the command: `node migration-script.js`
 */

try {
    const admin = require("firebase-admin");
    require('dotenv').config({ path: '.env.local' });

    // Validate that the service account JSON is loaded
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable not found. Please check your .env.local file.');
    }

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const db = admin.firestore();

    // --- Local Data Imports ---
    const { contactInfo } = require("./src/Data/contactData");
    const { experiences, filmExperiences, workExperiences } = require("./src/Data/experiencesData");
    const formations = require("./src/Data/formationsData");
    const { homeContent } = require("./src/Data/homeData");
    const { videos, playlists, images } = require("./src/Data/projectsData");
    const { technicalSkills, comprehensiveSkills, languages } = require("./src/Data/skillsData");
    const { socialMediaLinks } = require("./src/Data/socialMediaData");
    const statistics = require("./src/Data/statisticsData");

    const uploadCollection = async (collectionName, dataArray) => {
      const collectionRef = db.collection(collectionName);
      const batch = db.batch();
      dataArray.forEach((item) => {
        const docRef = collectionRef.doc();
        batch.set(docRef, item);
      });
      await batch.commit();
      
    };

    const uploadDocument = async (collectionName, documentId, data) => {
        await db.collection(collectionName).doc(documentId).set(data);
        
    }

    const migrateAll = async () => {
      
      await uploadCollection('contactInfo', contactInfo);
      await uploadCollection('formations', formations);
      const allExperiences = [
          ...experiences.map(exp => ({ ...exp, type: 'Work' })),
          ...filmExperiences.map(exp => ({ ...exp, type: 'Film' })),
          ...workExperiences.map(exp => ({ ...exp, type: 'Work' }))
      ];
      const uniqueExperiences = Array.from(new Map(allExperiences.map(e => [`${e.title}-${e.company}`, e])).values());
      await uploadCollection('experiences', uniqueExperiences);
      const allProjects = [
          ...videos.map(p => ({ ...p, type: 'video' })),
          ...playlists.map(p => ({ ...p, type: 'playlist' })),
          ...images.map(p => ({ ...p, type: 'image' }))
      ];
      await uploadCollection('projects', allProjects);
      const allSkills = [
          ...technicalSkills.map(s => ({ ...s, category: 'technical' })),
          ...comprehensiveSkills.map(s => ({ ...s, category: 'comprehensive' })),
          ...languages.map(s => ({ ...s, category: 'language' }))
      ];
      await uploadCollection('skills', allSkills);
      await uploadDocument('siteContent', 'home', homeContent);
      await uploadDocument('siteContent', 'socialMedia', { links: socialMediaLinks });
      await uploadDocument('siteContent', 'statistics', { items: statistics });
      
    };

    migrateAll();

} catch (error) {
    
    process.exit(1);
}

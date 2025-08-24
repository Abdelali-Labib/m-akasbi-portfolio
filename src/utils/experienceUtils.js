/**
 * Utility functions for experience management and role processing
 */

/**
 * Normalize strings for comparison (removes extra spaces, converts to lowercase)
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
export const normalizeString = (str) => {
  return str ? String(str).trim().toLowerCase() : "";
};

/**
 * Map role names to appropriate icons
 * @param {string} role - Role name to map
 * @returns {Function} React icon component
 */
export const getRoleIcon = (role) => {
  const r = role.toLowerCase();
  if (r.includes('réalisateur')) return 'FaStar';
  if (r.includes('formateur') || r.includes('professeur')) return 'FaUsers';
  if (r.includes('infograph') || r.includes('vidéo')) return 'FaPalette';
  if (r.includes('monteur') || r.includes('cameraman')) return 'FaRocket';
  if (r.includes('technicien')) return 'FaTools';
  if (r.includes('lead') || r.includes('manager')) return 'FaChartLine';
  return 'FaBriefcase';
};

/**
 * Get consistent color scheme for role badges
 * @returns {string} Tailwind gradient classes
 */
export const getRoleColor = () => 'from-accent/20 to-accent/10';

/**
 * Check if an experience represents a current position
 * @param {Object} experience - Experience object
 * @returns {boolean} Whether this is a current position
 */
export const isCurrentPosition = (experience) => {
  return (
    (experience.period && experience.period.toLowerCase().includes("aujourd")) ||
    (experience.role && experience.role.toLowerCase().includes("poste actuel"))
  );
};

/**
 * Determine if role badge should be shown (avoid duplication with title)
 * @param {Object} experience - Experience object
 * @returns {boolean} Whether to show the role badge
 */
export const shouldShowRoleBadge = (experience) => {
  const normalizedRole = normalizeString(experience.role);
  const normalizedTitle = normalizeString(experience.title);
  return !!normalizedRole && normalizedRole !== normalizedTitle;
};

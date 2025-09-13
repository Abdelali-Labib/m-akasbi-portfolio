/**
 * Utility functions for skill management and UI animation.
 */

/**
 * Animates skill percentages for smooth UI transitions.
 * @param {Array} targetPercentages - Target percentage values
 * @param {Function} setAnimatedPercentages - State setter
 * @param {number} stepTime - Animation step time (ms)
 */
export const animateSkillPercentages = (targetPercentages, setAnimatedPercentages, stepTime = 30) => {
  targetPercentages.forEach((target, index) => {
    let start = 0;
    
    const interval = setInterval(() => {
      start += 1;
      setAnimatedPercentages((prev) => {
        const updated = [...prev];
        updated[index] = start;
        return updated;
      });

      if (start >= target) {
        clearInterval(interval);
      }
    }, stepTime);
  });
};

/**
 * Sets up scroll listener for floating button visibility.
 * @param {string} targetElementId - ID of the element to track
 * @param {Function} setShowButton - State setter for button visibility
 */
export const setupScrollListener = (targetElementId, setShowButton) => {
  const handleScroll = () => {
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      // Show button if target element is above the viewport
      setShowButton(rect.bottom < 0);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
};

/**
 * Smooth scroll to target element
 * @param {string} elementId - ID of the element to scroll to
 */
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
};

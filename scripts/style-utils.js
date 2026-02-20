/**
 * Your Flavor - Shared Style Utilities
 * Common style application logic used by both chat rendering and config preview
 * @module your-flavor/style-utils
 */

/**
 * Apply flavor CSS custom properties to an HTML element
 * @param {HTMLElement} element - Target element
 * @param {Object} customizations - The customizations object from config
 * @param {Object} [layoutDefaults] - Optional layout defaults to merge under customizations
 */
export function applyFlavorStyles(element, customizations, layoutDefaults = {}) {
    const styles = { ...layoutDefaults, ...customizations };

    element.style.setProperty('--yf-font-family', styles.fontFamily && styles.fontFamily !== 'inherit' ? `"${styles.fontFamily}", serif` : 'inherit');
    element.style.setProperty('--yf-font-size', `${styles.fontSize || 14}px`);
    element.style.setProperty('--yf-text-color', styles.textColor || '#e8dcc8');

    // Apply background with opacity override
    let bgColor = styles.backgroundColor || 'rgba(20, 16, 12, 0.95)';
    if (styles.backgroundOpacity != null) {
        const opacity = Math.max(0, Math.min(100, styles.backgroundOpacity)) / 100;
        bgColor = _applyOpacityToColor(bgColor, opacity);
    }
    element.style.setProperty('--yf-bg-color', bgColor);

    element.style.setProperty('--yf-border-color', styles.borderColor || '#c9a227');
    element.style.setProperty('--yf-border-width', `${styles.borderWidth || 2}px`);
    element.style.setProperty('--yf-border-style', styles.borderStyle || 'solid');
    element.style.setProperty('--yf-border-radius', `${styles.borderRadius || 8}px`);
    element.style.setProperty('--yf-padding', `${styles.padding || 12}px`);

    // Name and timestamp colors with fallbacks
    const nameColor = styles.nameColor || styles.borderColor || '#c9a227';
    const timestampColor = styles.timestampColor || styles.textColor || '#e8dcc8';
    element.style.setProperty('--yf-name-color', nameColor);
    element.style.setProperty('--yf-timestamp-color', timestampColor);

    // Build box-shadow
    const shadows = [];
    if (styles.glowEnabled && styles.glowColor) {
        const intensity = styles.glowIntensity || 10;
        shadows.push(`0 0 ${intensity}px ${styles.glowColor}`);
        shadows.push(`0 0 ${intensity * 2}px ${styles.glowColor}`);
    }
    if (styles.shadowEnabled) {
        shadows.push('0 4px 15px rgba(0, 0, 0, 0.5)');
    }
    element.style.setProperty('--yf-box-shadow', shadows.length > 0 ? shadows.join(', ') : 'none');
}

/**
 * Apply an opacity value to a color string (hex or rgba)
 * @param {string} color - CSS color string
 * @param {number} opacity - Opacity value 0-1
 * @returns {string} rgba color string
 * @private
 */
function _applyOpacityToColor(color, opacity) {
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    if (color.startsWith('rgba')) {
        return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
    }
    if (color.startsWith('rgb(')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
        }
    }
    return color;
}

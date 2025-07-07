// Team Branding Utility Service
// Provides easy access to team logos, colors, and branding data

/**
 * Get team branding data by team ID
 * @param {string} teamId - The team's sportsdata.io ID
 * @param {Array} teams - Array of teams from API
 * @returns {Object|null} Team branding data or null if not found
 */
export const getTeamBranding = (teamId, teams) => {
  const team = teams?.find(t => t.id === teamId || t.key === teamId);
  return team ? {
    id: team.id,
    key: team.key,
    name: team.name,
    abbreviation: team.key,
    primaryColor: team.primaryColor,
    secondaryColor: team.secondaryColor,
    tertiaryColor: team.tertiaryColor,
    quaternaryColor: team.quaternaryColor,
    logoUrl: team.wikipediaLogoUrl,
    logoDarkUrl: team.wikipediaLogoUrl,
    logoScoreboardUrl: team.wikipediaLogoUrl,
    displayName: `${team.city} ${team.name}`,
    shortDisplayName: team.name
  } : null;
};

/**
 * Get team branding data by abbreviation
 * @param {string} abbreviation - Team abbreviation (e.g., 'BOS', 'LAL')
 * @param {Array} teams - Array of teams from API
 * @returns {Object|null} Team branding data or null if not found
 */
export const getTeamBrandingByAbbr = (abbreviation, teams) => {
  const team = teams?.find(t => t.key === abbreviation);
  return team ? getTeamBranding(team.id, teams) : null;
};

/**
 * Get team logo URL with fallback
 * @param {string} teamId - The team's sportsdata.io ID or key
 * @param {Array} teams - Array of teams from API
 * @param {string} variant - Logo variant: 'default', 'dark', 'scoreboard'
 * @returns {string|null} Logo URL or null if not found
 */
export const getTeamLogo = (teamId, teams, variant = 'default') => {
  const team = teams?.find(t => t.id === teamId || t.key === teamId);
  if (!team) return null;

  // All variants use the same Wikipedia logo URL for now
  return team.wikipediaLogoUrl;
};

/**
 * Get team primary color with fallback
 * @param {string} teamId - The team's sportsdata.io ID or key
 * @param {Array} teams - Array of teams from API
 * @returns {string} Hex color or default gray
 */
export const getTeamPrimaryColor = (teamId, teams) => {
  const team = teams?.find(t => t.id === teamId || t.key === teamId);
  return team?.primaryColor ? `#${team.primaryColor}` : '#6b7280';
};

/**
 * Get team secondary color with fallback
 * @param {string} teamId - The team's sportsdata.io ID or key
 * @param {Array} teams - Array of teams from API
 * @returns {string} Hex color or default white
 */
export const getTeamAlternateColor = (teamId, teams) => {
  const team = teams?.find(t => t.id === teamId || t.key === teamId);
  return team?.secondaryColor ? `#${team.secondaryColor}` : '#ffffff';
};

/**
 * Get team color scheme (primary + alternate)
 * @param {string} teamId - The team's sportsdata.io ID or key
 * @param {Array} teams - Array of teams from API
 * @returns {Object} Color scheme object
 */
export const getTeamColorScheme = (teamId, teams) => {
  return {
    primary: getTeamPrimaryColor(teamId, teams),
    alternate: getTeamAlternateColor(teamId, teams)
  };
};

/**
 * Create CSS styles object for team branding
 * @param {string} teamId - The team's sportsdata.io ID or key
 * @param {Array} teams - Array of teams from API
 * @returns {Object} CSS styles object
 */
export const getTeamStyles = (teamId, teams) => {
  const colors = getTeamColorScheme(teamId, teams);
  return {
    backgroundColor: colors.primary,
    color: colors.alternate,
    borderColor: colors.primary
  };
};

/**
 * Get team display name with fallback
 * @param {string} teamId - The team's sportsdata.io ID or key
 * @param {Array} teams - Array of teams from API
 * @returns {string} Team display name
 */
export const getTeamDisplayName = (teamId, teams) => {
  const team = teams?.find(t => t.id === teamId || t.key === teamId);
  return team ? `${team.city} ${team.name}` : 'Unknown Team';
};

/**
 * Get team short display name with fallback
 * @param {string} teamId - The team's sportsdata.io ID or key
 * @param {Array} teams - Array of teams from API
 * @returns {string} Team short display name
 */
export const getTeamShortDisplayName = (teamId, teams) => {
  const team = teams?.find(t => t.id === teamId || t.key === teamId);
  return team?.name || 'Unknown';
}; 
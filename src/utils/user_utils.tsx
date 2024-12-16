export function calculateLevelProgress(currentXP: number): {
    level: number,
    xpToNextLevel: number,
    totalXPForNextLevel: number
} {
    const XP_BASE = 300; // Base amount of experience for the first level
    const XP_GROWTH = 100; // Increase in experience requirements per level

    let level = 1; // Starting at level one
    let totalXPForLevel = XP_BASE; // Experience for current level

    // Calculate the player's level
    while (currentXP >= totalXPForLevel) {
        currentXP -= totalXPForLevel;
        level++;
        totalXPForLevel = XP_BASE + (level - 1) * XP_GROWTH;
    }

    // Remaining experience to the next level
    const xpToNextLevel = totalXPForLevel - currentXP;

    return {
        level,
        xpToNextLevel,
        totalXPForNextLevel: totalXPForLevel
    };
}
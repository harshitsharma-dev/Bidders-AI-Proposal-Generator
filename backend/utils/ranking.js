// utils/ranking.js

/**
 * Calculate a rank score for a bidder’s proposal
 * based on tender requirements and bidder profile strength.
 *
 * @param {Object} profile - The bidder's profile
 * @param {Object} proposal - The proposal submitted
 * @param {Object} tender - The tender requirements
 * @returns {number} - Rank score
 */
export const calculateRank = (profile, proposal, tender) => {
  let score = 0;

  // ✅ Budget check
  if (proposal.budget >= tender.requirements.minBudget) score += 20;

  // ✅ Timeline check
  if (proposal.timeline <= tender.requirements.maxTimeline) score += 20;

  // ✅ Material match (compare proposal materials to tender requirements)
  const materialMatch = tender.requirements.requiredMaterials.filter(m =>
    proposal.materials.includes(m)
  ).length;
  score += materialMatch * 10;

  // ✅ Profile strength
  if (profile.experienceYears >= 5) score += 20;

  if (
    profile.specialization.some(s =>
      tender.requirements.requiredSpecialization.includes(s)
    )
  ) {
    score += 20;
  }

  return score;
};

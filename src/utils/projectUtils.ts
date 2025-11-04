import type { JobAssignment } from "../types";

/**
 * Checks if a project's staging date is in the past or today (items have been staged)
 */
export const isProjectStaged = (project: JobAssignment): boolean => {
  if (!project.stagingDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stagingDate = new Date(project.stagingDate);
  stagingDate.setHours(0, 0, 0, 0);
  
  return stagingDate <= today;
};

/**
 * Checks if staging date is in the future (upcoming)
 */
export const isProjectUpcoming = (project: JobAssignment): boolean => {
  if (!project.stagingDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const staging = new Date(project.stagingDate);
  staging.setHours(0, 0, 0, 0);
  
  return staging > today;
};

/**
 * Gets the staging status based on staging date
 */
export const getStagingStatus = (project: JobAssignment): "staged" | "upcoming" | undefined => {
  if (!project.stagingDate) return undefined;
  
  if (isProjectStaged(project)) return "staged";
  if (isProjectUpcoming(project)) return "upcoming";
  
  return undefined;
};

/**
 * Gets the item IDs for a project, returning empty array if staging is in the future
 */
export const getProjectItemIds = (project: JobAssignment): string[] => {
  if (!isProjectStaged(project)) {
    return [];
  }
  return project.itemIds || [];
};

/**
 * Checks if staging date is in the future (alias for isProjectUpcoming)
 */
export const isStagingUpcoming = (stagingDate?: Date): boolean => {
  if (!stagingDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const staging = new Date(stagingDate);
  staging.setHours(0, 0, 0, 0);
  
  return staging > today;
};

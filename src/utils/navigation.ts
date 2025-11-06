import type { AppState } from "../types";

export function getBackNavigation(currentState: AppState): AppState {
  switch (currentState) {
    case "library":
    case "inUse":
    case "reports":
    case "allProjects":
      return "dashboard";
    case "itemDetail":
    case "assignToJob":
      return "library";
    case "projectDetail":
      return "allProjects";
    case "addItem":
    case "bulkUpload":
      return "library";
    default:
      return "dashboard";
  }
}

export function shouldShowBackButton(currentState: AppState): boolean {
  return currentState !== "dashboard";
}



import React, { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { AuthScreen } from "./components/AuthScreen";
import { VerificationScreen } from "./components/VerificationScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { AppHeader } from "./components/AppHeader";
import { GridDashboard } from "./components/GridDashboard";
import { AddItem } from "./components/AddItem";
import { BulkUpload } from "./components/BulkUpload";
import { MultiItemImageUpload } from "./components/MultiItemImageUpload";
import { ImageGallery } from "./components/ImageGallery";
import { InventoryLibrary } from "./components/InventoryLibrary";
import { InUse } from "./components/InUse";
import { ItemDetail } from "./components/ItemDetail";
import { AssignToJob } from "./components/AssignToJob";
import { ReportsInsights } from "./components/ReportsInsights";
import { ProjectDetail } from "./components/ProjectDetail";
import { AllProjects } from "./components/AllProjects";
import { Settings } from "./components/Settings";
import { toast } from "sonner@2.0.3";
import type { AppState, AuthMode, UserData, InventoryItem, JobAssignment } from "./types";
import { mockInventoryItems, mockJobAssignments } from "./mockData";

export default function App() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    phoneNumber: "",
    businessName: "",
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedReportItem, setSelectedReportItem] = useState<InventoryItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<JobAssignment | null>(null);
  const [jobAssignments, setJobAssignments] = useState<JobAssignment[]>(mockJobAssignments);
  const [multiItemUploadData, setMultiItemUploadData] = useState<any>(null);
  const [previousState, setPreviousState] = useState<AppState | null>(null);

  const handleSendCode = (mode: AuthMode, data: Partial<UserData>) => {
    setAuthMode(mode);
    setUserData((prev) => ({ ...prev, ...data }));
    setAppState("verify");
  };

  const handleGoogleAuth = () => {
    // Set demo user data
    setUserData({
      fullName: "John Doe",
      phoneNumber: "(555) 123-4567",
      businessName: "Acme Corporation",
    });
    setAppState("loading");
  };

  const handleVerify = () => {
    setAppState("loading");
  };

  const handleBackToAuth = () => {
    setAppState("auth");
  };

  const [libraryFilter, setLibraryFilter] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const handleNavigate = (state: AppState, data?: any) => {
    // Track previous state when navigating to addItem
    // Only update previousState if we're not already on addItem (to preserve the original source)
    if (state === "addItem" && appState !== "addItem") {
      // Use current appState as previous, but fallback to "dashboard" if appState is invalid
      const validPreviousState = appState && appState !== "addItem" ? appState : "dashboard";
      setPreviousState(validPreviousState);
    }
    
    // Handle selectedItem state
    if (state === "itemDetail" && data?.item) {
      setSelectedItem(data.item);
    } else if (state === "assignToJob") {
      // Handle assignToJob navigation
      if (data?.item) {
        // Assigning inventory to a project - set the item
        setSelectedItem(data.item);
      } else {
        // Creating a new project (not assigning inventory) - explicitly clear selectedItem
        setSelectedItem(null);
      }
    } else if (state !== "itemDetail" && state !== "assignToJob") {
      // Clear selectedItem when navigating to other states (unless they explicitly set it)
      // This prevents stale selectedItem from affecting assignToJob when creating a project
      setSelectedItem(null);
    }
    
    if (state === "library" && data?.filter) {
      setLibraryFilter(data.filter);
      setSelectedProjectId(undefined);
    } else if (state === "library" && data?.selectedProjectId) {
      setLibraryFilter("all");
      setSelectedProjectId(data.selectedProjectId);
    } else if (state === "library") {
      setLibraryFilter("all");
      setSelectedProjectId(undefined);
    } else if (state === "reports" && data?.selectedItem) {
      setSelectedReportItem(data.selectedItem);
    } else if (state === "reports") {
      setSelectedReportItem(null);
    } else if (state === "projectDetail" && data?.project) {
      setSelectedProject(data.project);
    } else if (state === "multiItemUpload") {
      setMultiItemUploadData(data || null);
    }
    setAppState(state);
  };

  const handleSaveItem = (item: InventoryItem) => {
    setInventoryItems((prev) => [...prev, item]);
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    // Update selected item if it's the one being updated
    if (selectedItem && selectedItem.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setInventoryItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCreateJob = (job: JobAssignment) => {
    setJobAssignments((prev) => [...prev, job]);
  };

  const handleUpdateJob = (updatedJob: JobAssignment) => {
    setJobAssignments((prev) => 
      prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
    );
    // Update selected project if it's the one being updated
    if (selectedProject && selectedProject.id === updatedJob.id) {
      setSelectedProject(updatedJob);
    }
  };

  // Auto-transition from loading to dashboard
  useEffect(() => {
    if (appState === "loading") {
      const timer = setTimeout(() => {
        setAppState("dashboard");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const needsHeader =
    appState === "dashboard" ||
    appState === "library" ||
    appState === "inUse" ||
    appState === "reports" ||
    appState === "projectDetail" ||
    appState === "allProjects" ||
    appState === "addItem" ||
    appState === "bulkUpload" ||
    appState === "multiItemUpload" ||
    appState === "imageGallery" ||
    appState === "itemDetail" ||
    appState === "assignToJob" ||
    appState === "settings";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-full">
      {needsHeader && (
        <AppHeader
          user={userData}
          currentState={appState}
          onNavigate={handleNavigate}
        />
      )}

      {appState === "auth" && (
        <AuthScreen
          onSendCode={handleSendCode}
          onGoogleAuth={handleGoogleAuth}
        />
      )}

      {appState === "verify" && (
        <VerificationScreen
          mode={authMode}
          phoneNumber={userData.phoneNumber}
          onVerify={handleVerify}
          onBack={handleBackToAuth}
        />
      )}

      {appState === "loading" && <LoadingScreen />}

      {appState === "dashboard" && (
        <GridDashboard onNavigate={handleNavigate} jobAssignments={jobAssignments} />
      )}

      {appState === "addItem" && (
        <AddItem 
          onNavigate={handleNavigate} 
          onSave={handleSaveItem}
          previousState={previousState || "dashboard"}
        />
      )}

      {appState === "bulkUpload" && (
        <BulkUpload onNavigate={handleNavigate} />
      )}

      {appState === "multiItemUpload" && (
        <MultiItemImageUpload 
          onNavigate={handleNavigate} 
          onSave={handleSaveItem}
          autoLoadDiningSet={multiItemUploadData?.autoLoadDiningSet || false}
        />
      )}

      {appState === "imageGallery" && (
        <ImageGallery 
          onNavigate={handleNavigate}
          onSelectImage={(imagePath, imageSrc) => {
            // Store selected image info for use in multi-item upload
            localStorage.setItem("selectedDiningSetImage", JSON.stringify({ path: imagePath, src: imageSrc }));
            toast.success(`Selected image: ${imagePath}`);
          }}
        />
      )}

      {appState === "library" && (
        <InventoryLibrary
          items={inventoryItems}
          onNavigate={handleNavigate}
          initialFilter={libraryFilter}
          jobAssignments={jobAssignments}
        />
      )}

      {appState === "inUse" && (
        <InUse
          items={inventoryItems}
          onNavigate={handleNavigate}
          jobAssignments={jobAssignments}
        />
      )}

      {appState === "itemDetail" && selectedItem && (
        <ItemDetail
          item={selectedItem}
          onNavigate={handleNavigate}
          onDelete={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
          jobAssignments={jobAssignments}
        />
      )}

      {appState === "assignToJob" && (
        <AssignToJob
          item={selectedItem || undefined}
          onNavigate={handleNavigate}
          onCreateJob={handleCreateJob}
          jobAssignments={jobAssignments}
          onUpdateJob={handleUpdateJob}
        />
      )}

      {appState === "reports" && (
        <ReportsInsights
          items={inventoryItems}
          onNavigate={handleNavigate}
          selectedItem={selectedReportItem}
          jobAssignments={jobAssignments}
        />
      )}

      {appState === "projectDetail" && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          items={inventoryItems}
          onNavigate={handleNavigate}
          onUpdateJob={handleUpdateJob}
          jobAssignments={jobAssignments}
        />
      )}

      {appState === "allProjects" && (
        <AllProjects
          jobAssignments={jobAssignments}
          onNavigate={handleNavigate}
        />
      )}

      {appState === "settings" && (
        <Settings onNavigate={handleNavigate} />
      )}

      <Toaster />
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
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
      // Always get the latest project data from jobAssignments to ensure we have the most up-to-date state
      const latestProject = jobAssignments.find(job => job.id === data.project.id) || data.project;
      setSelectedProject(latestProject);
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

  // Ref to track the last updated job to prevent race conditions
  const lastUpdatedJobRef = useRef<string | null>(null);
  // Track when we last updated via handleUpdateJob to prevent useEffect from overwriting
  const lastUpdateTimestampRef = useRef<number>(0);

  const handleUpdateJob = (updatedJob: JobAssignment) => {
    // Track that we're updating this job to prevent useEffect from interfering
    lastUpdatedJobRef.current = updatedJob.id;
    // Track timestamp to prevent useEffect from overwriting recent updates
    lastUpdateTimestampRef.current = Date.now();
    
    // Ensure itemIds is always an array (defensive programming)
    const jobWithItemIds = {
      ...updatedJob,
      itemIds: Array.isArray(updatedJob.itemIds) ? updatedJob.itemIds : (updatedJob.itemIds ? [updatedJob.itemIds] : []),
    };
    
    // Debug: Log the update
    console.log('handleUpdateJob called:', {
      jobId: jobWithItemIds.id,
      itemIds: jobWithItemIds.itemIds,
      itemIdsLength: jobWithItemIds.itemIds.length,
      timestamp: lastUpdateTimestampRef.current,
    });
    
    // Update jobAssignments state
    setJobAssignments((prev) => {
      const jobIndex = prev.findIndex((job) => job.id === jobWithItemIds.id);
      if (jobIndex === -1) {
        // Job not found, add it (shouldn't happen but handle gracefully)
        console.log('Job not found, adding new job');
        return [...prev, jobWithItemIds];
      }
      // Create a new array with the updated job - ensure we're using the exact updatedJob passed in
      const updated = [...prev];
      const oldJob = updated[jobIndex];
      updated[jobIndex] = { ...jobWithItemIds }; // Create a new object reference
      
      console.log('Job updated:', {
        oldItemIds: oldJob.itemIds,
        newItemIds: updated[jobIndex].itemIds,
        oldLength: (oldJob.itemIds || []).length,
        newLength: (updated[jobIndex].itemIds || []).length,
      });
      
      return updated;
    });
    
    // Update selected project if it's the one being updated
    // Use functional update to ensure we're working with latest state
    setSelectedProject((currentSelectedProject) => {
      if (currentSelectedProject && currentSelectedProject.id === jobWithItemIds.id) {
        console.log('Updating selectedProject with new itemIds:', jobWithItemIds.itemIds);
        return { ...jobWithItemIds }; // Create a new object reference
      }
      return currentSelectedProject; // Return unchanged if not the selected project
    });
    
    // Update selectedItem if we're viewing an item detail and the item was assigned
    // This ensures the item detail reflects the updated assignments
    if (selectedItem && jobWithItemIds.itemIds && jobWithItemIds.itemIds.includes(selectedItem.id)) {
      // Force a re-render by updating selectedItem reference
      // The ItemDetail component will recalculate quantities based on updated jobAssignments
      setSelectedItem({ ...selectedItem });
    }
    
    // Clear the tracking ref after a delay to allow state to settle
    // This prevents the useEffect from overwriting our update
    // Increased delay to ensure state updates complete
    setTimeout(() => {
      if (lastUpdatedJobRef.current === jobWithItemIds.id) {
        lastUpdatedJobRef.current = null;
        // Keep timestamp for additional 1 second to prevent any late-running useEffects
        setTimeout(() => {
          if (Date.now() - lastUpdateTimestampRef.current > 2000) {
            lastUpdateTimestampRef.current = 0;
          }
        }, 1000);
      }
    }, 1500); // Increased to 1500ms for more robustness
  };

  // Keep selectedProject in sync with jobAssignments
  // This ensures that when jobAssignments is updated externally, selectedProject reflects the latest data
  // We skip sync when we just updated via handleUpdateJob to prevent race conditions
  useEffect(() => {
    // Skip sync if we just updated this project in handleUpdateJob (prevent race condition)
    // Also skip if update was very recent (within 2 seconds) to prevent race conditions
    const timeSinceLastUpdate = Date.now() - lastUpdateTimestampRef.current;
    if (selectedProject && (lastUpdatedJobRef.current === selectedProject.id || timeSinceLastUpdate < 2000)) {
      console.log('useEffect sync skipped - handleUpdateJob just updated this project', {
        jobId: lastUpdatedJobRef.current,
        selectedProjectId: selectedProject.id,
        timeSinceLastUpdate,
      });
      return;
    }
    
    if (selectedProject && appState === "projectDetail") {
      const updatedProject = jobAssignments.find(job => job.id === selectedProject.id);
      if (updatedProject) {
        // Compare itemIds to detect if there are actual changes
        const currentItemIds = JSON.stringify((selectedProject.itemIds || []).sort());
        const updatedItemIds = JSON.stringify((updatedProject.itemIds || []).sort());
        // Only update if itemIds have actually changed AND the updated version has more or equal items
        // This prevents reverting to an older state
        if (currentItemIds !== updatedItemIds) {
          const currentCount = (selectedProject.itemIds || []).length;
          const updatedCount = (updatedProject.itemIds || []).length;
          
          console.log('useEffect sync check:', {
            currentItemIds: selectedProject.itemIds,
            updatedItemIds: updatedProject.itemIds,
            currentCount,
            updatedCount,
            willUpdate: updatedCount >= currentCount,
          });
          
          // Update if the updated version has MORE items OR if it's the same count but different items
          // This ensures we always get the latest data without losing items
          if (updatedCount >= currentCount) {
            console.log('useEffect updating selectedProject');
            setSelectedProject(updatedProject);
          } else {
            console.log('useEffect NOT updating - would lose items');
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobAssignments, appState]); // selectedProject.id is stable, so we can safely omit it from deps

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

      {appState === "projectDetail" && selectedProject && (() => {
        // Always get the latest project data from jobAssignments to ensure we have the most up-to-date state
        const latestProject = jobAssignments.find(job => job.id === selectedProject.id) || selectedProject;
        return (
          <ProjectDetail
            project={latestProject}
            items={inventoryItems}
            onNavigate={handleNavigate}
            onUpdateJob={handleUpdateJob}
            jobAssignments={jobAssignments}
          />
        );
      })()}

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

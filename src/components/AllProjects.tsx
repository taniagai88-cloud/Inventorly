import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  LayoutGrid,
  FolderPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { format } from "date-fns";
import type { AppState, JobAssignment } from "../types";
import { getProjectItemIds, isProjectStaged, isStagingUpcoming, getStagingStatus } from "../utils/projectUtils";

interface AllProjectsProps {
  jobAssignments: JobAssignment[];
  onNavigate: (state: AppState, data?: any) => void;
}

export function AllProjects({ jobAssignments, onNavigate }: AllProjectsProps) {
  const [projectFilter, setProjectFilter] = useState<"all" | "staged" | "upcoming">("all");
  const [projectView, setProjectView] = useState<"card" | "calendar">("card");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Get all active projects
  const allActiveProjects = jobAssignments.filter(job => job.status === "active");

  // Filter projects
  const filteredProjects = allActiveProjects.filter(job => {
    if (projectFilter === "all") return true;
    if (projectFilter === "staged") return isProjectStaged(job);
    if (projectFilter === "upcoming") return isStagingUpcoming(job.stagingDate);
    return true;
  });

  // Sort projects: upcoming first, then by staging date
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aIsUpcoming = isStagingUpcoming(a.stagingDate);
    const bIsUpcoming = isStagingUpcoming(b.stagingDate);
    
    // Prioritize upcoming projects
    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;
    
    // If both or neither are upcoming, sort by staging date
    if (!a.stagingDate && !b.stagingDate) return 0;
    if (!a.stagingDate) return 1;
    if (!b.stagingDate) return -1;
    return a.stagingDate.getTime() - b.stagingDate.getTime();
  });

  const getDaysLeft = (stagingDate?: Date) => {
    if (!stagingDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const staging = new Date(stagingDate);
    staging.setHours(0, 0, 0, 0);
    const diff = Math.ceil((staging.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-foreground text-xl sm:text-2xl font-bold">All Projects</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {sortedProjects.length} {sortedProjects.length === 1 ? "project" : "projects"}
              </p>
            </div>
            <Button onClick={() => onNavigate("assignToJob")} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
              <FolderPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Project</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={projectView === "card" ? "default" : "outline"}
                size="sm"
                className="gap-2 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
                onClick={() => setProjectView("card")}
              >
                <LayoutGrid className="w-4 h-4" />
                Card
              </Button>
              <Button
                variant={projectView === "calendar" ? "default" : "outline"}
                size="sm"
                className="gap-2 flex-1 sm:flex-initial min-h-[44px] touch-manipulation"
                onClick={() => setProjectView("calendar")}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto min-h-[44px] touch-manipulation">
                  <Filter className="w-4 h-4" />
                  {projectFilter === "all" ? "All" : projectFilter === "staged" ? "Staged" : "Upcoming"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setProjectFilter("all")}>All Projects</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectFilter("staged")}>Staged Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectFilter("upcoming")}>Upcoming Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {projectView === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedProjects.map((job, index) => {
                const projectItems = getProjectItemIds(job);
                const daysLeft = getDaysLeft(job.stagingDate);
                const isUpcoming = isStagingUpcoming(job.stagingDate);
                
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="bg-card border-border elevation-sm p-4 sm:p-6 cursor-pointer hover:elevation-md transition-shadow h-full group touch-manipulation"
                      onClick={() => onNavigate("projectDetail", { project: job })}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-foreground mb-1 group-hover:text-white transition-colors">{job.clientName || job.shortAddress || job.jobLocation}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-white transition-colors">
                            <MapPin className="w-3 h-3" />
                            <p className="text-sm">{job.jobLocation}</p>
                          </div>
                        </div>
                        {(() => {
                          const status = getStagingStatus(job);
                          return (
                            <Badge variant={status === "staged" ? "default" : "secondary"}>
                              {status === "staged" ? "Staged" : status === "upcoming" ? "Upcoming" : "Pending"}
                        </Badge>
                          );
                        })()}
                      </div>

                      {job.stagingDate && (
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                            <CalendarIcon className="w-4 h-4" />
                            <span className="text-sm">{format(job.stagingDate, "MMM d, yyyy")}</span>
                          </div>
                          {daysLeft !== null && daysLeft >= 0 && (
                            <div className={`flex items-center gap-1 text-sm ${isUpcoming ? 'text-chart-4' : 'text-muted-foreground'} group-hover:text-white transition-colors`}>
                              <Clock className="w-4 h-4" />
                              <span>
                                {isUpcoming 
                                  ? `${Math.max(0, Math.ceil((job.stagingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days away`
                                  : `${daysLeft}d left`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-muted-foreground text-sm group-hover:text-white transition-colors">
                          <span>Items</span>
                          <span>{projectItems.length} assigned</span>
                        </div>
                        {job.clientName && (
                          <div className="text-muted-foreground text-sm group-hover:text-white transition-colors">
                            Client: {job.clientName}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <Card className="bg-card border-border elevation-sm p-6 flex-1">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      const projectOnDate = sortedProjects.find(job => {
                        if (!job.stagingDate) return false;
                        const stagingDate = new Date(job.stagingDate);
                        stagingDate.setHours(0, 0, 0, 0);
                        const selectedDateOnly = new Date(date);
                        selectedDateOnly.setHours(0, 0, 0, 0);
                        return stagingDate.getTime() === selectedDateOnly.getTime();
                      });
                      if (projectOnDate) {
                        onNavigate("projectDetail", { project: projectOnDate });
                      }
                    }
                  }}
                  modifiers={{
                    hasProject: sortedProjects
                      .filter(job => job.stagingDate)
                      .map(job => {
                        const date = new Date(job.stagingDate!);
                        date.setHours(0, 0, 0, 0);
                        return date;
                      }) as Date[]
                  }}
                  modifiersClassNames={{
                    hasProject: "bg-primary/10 text-primary font-semibold"
                  }}
                  className="w-full"
                />
              </Card>
              <Card className="bg-card border-border elevation-sm p-6 lg:w-80">
                <h4 className="text-foreground mb-4">Projects by Date</h4>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {sortedProjects
                    .filter(job => job.stagingDate)
                    .map((job) => {
                      const projectItems = getProjectItemIds(job);
                      const isUpcoming = isStagingUpcoming(job.stagingDate);
                      const daysLeft = getDaysLeft(job.stagingDate);
                      return (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Card
                            className={`bg-muted border-border p-4 cursor-pointer hover:bg-muted/80 transition-colors group ${
                              selectedDate && job.stagingDate && 
                              new Date(selectedDate).setHours(0, 0, 0, 0) === new Date(job.stagingDate).setHours(0, 0, 0, 0)
                                ? "ring-2 ring-primary"
                                : ""
                            }`}
                            onClick={() => onNavigate("projectDetail", { project: job })}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-foreground text-sm font-medium group-hover:text-white transition-colors">{job.clientName || job.shortAddress || job.jobLocation}</h4>
                              {(() => {
                                const status = getStagingStatus(job);
                                return (
                                  <Badge variant={status === "staged" ? "default" : "secondary"} className="text-xs">
                                    {status === "staged" ? "Staged" : status === "upcoming" ? "Upcoming" : "Pending"}
                              </Badge>
                                );
                              })()}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2 group-hover:text-white transition-colors">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{format(job.stagingDate!, "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground group-hover:text-white transition-colors">{projectItems.length} items</span>
                              {daysLeft !== null && daysLeft >= 0 && (
                                <span className={`${isUpcoming ? "text-chart-4" : "text-muted-foreground"} group-hover:text-white transition-colors`}>
                                  {isUpcoming ? `${Math.max(0, Math.ceil((job.stagingDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}d away` : `${daysLeft}d left`}
                                </span>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  {sortedProjects.filter(job => job.stagingDate).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No projects with staging dates
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {sortedProjects.length === 0 && (
            <Card className="bg-card border-border elevation-sm p-8 text-center mt-6">
              <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-foreground mb-2">No Projects</h4>
              <p className="text-muted-foreground mb-4">
                {projectFilter !== "all" 
                  ? `No ${projectFilter} projects found. Try changing the filter.`
                  : "Create your first project to start tracking staging and deployments"}
              </p>
              {projectFilter === "all" && (
                <Button onClick={() => onNavigate("assignToJob")} variant="outline">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}


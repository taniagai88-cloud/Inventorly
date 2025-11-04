import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { differenceInDays } from "date-fns";
import type { JobAssignment, InventoryItem, AppState } from "../types";
import { isProjectStaged } from "../utils/projectUtils";

interface AIAssistantProps {
  jobAssignments: JobAssignment[];
  items: InventoryItem[];
  onNavigate: (state: AppState, data?: any) => void;
}

interface AIResponse {
  answer: string;
  projects?: Array<{
    project: JobAssignment;
    percentage: number;
    daysElapsed: number;
    daysRemaining: number;
  }>;
}

export function AIAssistant({ jobAssignments, items, onNavigate }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeHalfwayProjects = (): AIResponse => {
    const today = new Date();
    const stagedProjects = jobAssignments.filter(job => isProjectStaged(job) && job.status === "active");
    
    const projectsWithProgress = stagedProjects
      .map(project => {
        const stagingDate = project.stagingDate!;
        const contractEndDate = new Date(stagingDate.getTime() + 45 * 24 * 60 * 60 * 1000);
        const totalDays = 45;
        const daysElapsed = differenceInDays(today, stagingDate);
        const daysRemaining = differenceInDays(contractEndDate, today);
        const percentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
        
        return {
          project,
          percentage,
          daysElapsed,
          daysRemaining,
        };
      })
      .filter(p => p.percentage > 0 && p.percentage < 100);

    // Find projects close to 50% (within 10% range - days 18-27 of 45)
    const halfwayProjects = projectsWithProgress
      .filter(p => p.percentage >= 40 && p.percentage <= 60)
      .sort((a, b) => Math.abs(a.percentage - 50) - Math.abs(b.percentage - 50));

    if (halfwayProjects.length === 0) {
      const closestProject = projectsWithProgress.length > 0 
        ? projectsWithProgress.sort((a, b) => Math.abs(a.percentage - 50) - Math.abs(b.percentage - 50))[0]
        : null;
      
      if (closestProject) {
        return {
          answer: `None of your projects are exactly halfway through, but **${closestProject.project.clientName}** is the closest at **${Math.round(closestProject.percentage)}%** complete with **${closestProject.daysRemaining} days remaining** in the 45-day staging period.`,
          projects: [closestProject],
        };
      }
      
      return {
        answer: "Currently, none of your active projects are in the middle of their staging period. Most projects are either just starting or nearing completion.",
        projects: [],
      };
    }

    const closestToHalfway = halfwayProjects[0];
    const exactHalfwayDay = Math.round(45 / 2);
    
    const answer = halfwayProjects.length === 1
      ? `**${closestToHalfway.project.clientName}** is approximately halfway through the 45-day staging period at **${Math.round(closestToHalfway.percentage)}%** complete. The project started **${closestToHalfway.daysElapsed} days ago** with **${closestToHalfway.daysRemaining} days remaining**.`
      : `I found **${halfwayProjects.length} projects** approximately halfway through their staging periods. **${closestToHalfway.project.clientName}** is at **${Math.round(closestToHalfway.percentage)}%** (day ${closestToHalfway.daysElapsed} of 45) with **${closestToHalfway.daysRemaining} days left**.`;

    return {
      answer,
      projects: halfwayProjects,
    };
  };

  const analyzeUpcomingProjects = (): AIResponse => {
    const today = new Date();
    const upcomingProjects = jobAssignments
      .filter(job => {
        if (!job.stagingDate) return false;
        const stagingDate = new Date(job.stagingDate);
        return stagingDate > today;
      })
      .sort((a, b) => a.stagingDate!.getTime() - b.stagingDate!.getTime());

    if (upcomingProjects.length === 0) {
      return {
        answer: "You don't have any upcoming staging dates scheduled at the moment.",
        projects: [],
      };
    }

    const nextProject = upcomingProjects[0];
    const daysUntil = differenceInDays(nextProject.stagingDate!, today);
    
    return {
      answer: `You have **${upcomingProjects.length} upcoming projects**. The next one is **${nextProject.clientName}** staging in **${daysUntil} days**.`,
      projects: upcomingProjects.slice(0, 3).map(p => ({
        project: p,
        percentage: 0,
        daysElapsed: 0,
        daysRemaining: differenceInDays(p.stagingDate!, today),
      })),
    };
  };

  const analyzeMostUsedItems = (): AIResponse => {
    const sortedItems = [...items].sort((a, b) => b.usageCount - a.usageCount);
    const topItem = sortedItems[0];
    
    return {
      answer: `Your most-used item is **${topItem.name}** from the ${topItem.category} category, with **${topItem.usageCount} uses**. It currently has **${topItem.availableQuantity} units available** out of **${topItem.totalQuantity} total**.`,
      projects: [],
    };
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerPrompt = prompt.toLowerCase();
    let result: AIResponse;

    if (lowerPrompt.includes("halfway") || lowerPrompt.includes("half way") || lowerPrompt.includes("50%") || lowerPrompt.includes("middle")) {
      result = analyzeHalfwayProjects();
    } else if (lowerPrompt.includes("upcoming") || lowerPrompt.includes("next") || lowerPrompt.includes("future")) {
      result = analyzeUpcomingProjects();
    } else if (lowerPrompt.includes("most used") || lowerPrompt.includes("popular") || lowerPrompt.includes("frequently")) {
      result = analyzeMostUsedItems();
    } else {
      // Default response
      result = {
        answer: "I can help you with insights about your inventory and projects. Try asking me about:\n\n• Projects halfway through staging\n• Upcoming projects\n• Most-used items",
        projects: [],
      };
    }

    setResponse(result);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-card border-border elevation-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-chart-2 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="text-foreground">AI Assistant</h3>
      </div>

      <p className="text-muted-foreground mb-4">
        Ask me anything about your inventory and projects
      </p>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Which projects are halfway through staging?"
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-muted rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <p className="text-foreground whitespace-pre-line">
                  {response.answer.split("**").map((part, index) => 
                    index % 2 === 0 ? part : <strong key={index}>{part}</strong>
                  )}
                </p>
              </div>

              {response.projects && response.projects.length > 0 && (
                <div className="space-y-2 pt-2">
                  {response.projects.map(({ project, percentage, daysElapsed, daysRemaining }) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card rounded-lg p-3 border border-border cursor-pointer hover:elevation-sm transition-shadow"
                      onClick={() => onNavigate("projectDetail", { project })}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-foreground mb-1">{project.clientName}</h4>
                          <p className="text-muted-foreground">{project.shortAddress}</p>
                        </div>
                        {percentage > 0 && (
                          <Badge variant="outline">{Math.round(percentage)}%</Badge>
                        )}
                      </div>
                      {percentage > 0 ? (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-muted-foreground">
                            {daysRemaining}d left
                          </span>
                        </div>
                      ) : (
                        <p className="text-muted-foreground mt-2">
                          Staging in {daysRemaining} days
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

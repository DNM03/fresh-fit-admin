import { useState } from "react";
import * as z from "zod";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import skillService from "@/services/skill.service";

const skillSchema = z.object({
  name: z.string().min(2, "Skill name must be at least 2 characters"),
});

type Skill = {
  id: string;
  name: string;
};

interface SkillManageDialogProps {
  skills: Skill[];
  onSkillsChange: () => void;
  selectedSkillIds: string[];
}

export default function SkillManageDialog({
  skills,
  onSkillsChange,
  selectedSkillIds,
}: SkillManageDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);

  const handleAlertDialogClose = (open: any) => {
    setDeleteConfirmOpen(open);
    if (!open) {
      setTimeout(() => {
        setSkillToDelete(null);
      }, 100);
    }
  };

  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");

  const handleOpenChange = (open: boolean) => {
    if (!open && deleteConfirmOpen) {
      return;
    }

    if (!open) {
      resetForm();
      setIsCreating(false);
      setIsEditing(false);
      setCurrentSkill(null);
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
    }
    setIsDialogOpen(open);
  };

  const resetForm = () => {
    setFormName("");
    setFormError("");
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setCurrentSkill(null);
    resetForm();
  };

  const startEdit = (skill: Skill) => {
    setIsEditing(true);
    setIsCreating(false);
    setCurrentSkill(skill);
    setFormName(skill.name);
    setFormError("");
  };

  const confirmDelete = (skill: Skill) => {
    setSkillToDelete(skill);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!skillToDelete) return;

    setIsSubmitting(true);

    try {
      await skillService.deleteSkill([skillToDelete.id]);
      toast.success("Skill deleted successfully", {
        style: {
          background: "#3ac76b",
          color: "#fff",
        },
      });
      onSkillsChange();

      setDeleteConfirmOpen(false);

      setTimeout(() => {
        setSkillToDelete(null);
      }, 100);
    } catch (error) {
      console.error("Error deleting skill:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 400
      ) {
        toast.error(
          "Failed to delete skill. This skill is being used by another specialist",
          {
            style: {
              background: "#cc3131",
              color: "#fff",
            },
          }
        );
      } else {
        toast.error("Failed to delete skill", {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      skillSchema.parse({ name: formName });
      setFormError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormError(error.errors[0]?.message || "Invalid input");
      } else {
        setFormError("Invalid input");
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreating) {
        await skillService.addSkill(formName);
        toast.success("Skill created successfully", {
          style: {
            background: "#3ac76b",
            color: "#fff",
          },
        });
      } else if (isEditing && currentSkill) {
        await skillService.updateSkill(currentSkill.id, formName);
        toast.success("Skill updated successfully", {
          style: {
            background: "#3ac76b",
            color: "#fff",
          },
        });
      }

      resetForm();
      setIsCreating(false);
      setIsEditing(false);
      setCurrentSkill(null);
      onSkillsChange();
    } catch (error) {
      console.error("Error saving skill:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 400 &&
        "data" in error.response
      ) {
        const errorMessage =
          error.response.data &&
          typeof error.response.data === "object" &&
          "message" in error.response.data &&
          typeof error.response.data.message === "string"
            ? error.response.data.message
            : "Failed to save skill";
        toast.error(errorMessage, {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
      } else {
        toast.error("Failed to save skill", {
          style: {
            background: "#cc3131",
            color: "#fff",
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSkillInUse = (skillId: string) => {
    return selectedSkillIds.includes(skillId);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" type="button">
            Manage Skills
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Skill Management</DialogTitle>
            <DialogDescription>
              Create, edit or remove skills for specialists
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[400px] overflow-y-auto">
            {!isCreating && !isEditing && (
              <>
                <div className="mb-4 flex justify-end">
                  <Button onClick={startCreate} size="sm" type="button">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Skill
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skills.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="text-center py-6 text-muted-foreground"
                          >
                            No skills available. Add your first skill!
                          </TableCell>
                        </TableRow>
                      ) : (
                        skills.map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell className="font-medium">
                              {skill.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-end">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        onClick={() => startEdit(skill)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit skill</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        disabled={isSkillInUse(skill.id)}
                                        className={
                                          isSkillInUse(skill.id)
                                            ? "cursor-not-allowed opacity-50"
                                            : "text-destructive"
                                        }
                                        onClick={() => confirmDelete(skill)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {isSkillInUse(skill.id)
                                        ? "Cannot delete - skill is in use"
                                        : "Delete skill"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {(isCreating || isEditing) && (
              <div className="space-y-6 px-2">
                <div className="grid gap-2">
                  <Label htmlFor="skill-name">Skill Name</Label>
                  <Input
                    id="skill-name"
                    placeholder="e.g., Strength Training"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  {formError && (
                    <p className="text-sm font-medium text-destructive">
                      {formError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : isCreating
                      ? "Create"
                      : "Update"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={handleAlertDialogClose}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the skill "{skillToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

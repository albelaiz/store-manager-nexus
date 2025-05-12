
import React, { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted: () => void;
  userId: string;
  username: string;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  onUserDeleted,
  userId,
  username,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleDeleteUser = async () => {
    setIsSubmitting(true);
    
    try {
      // Get all users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Filter out the user to delete
      const updatedUsers = users.filter((user: any) => user.id !== userId);
      
      if (updatedUsers.length === users.length) {
        // User not found
        toast({
          title: "User not found",
          description: "Could not find the user to delete.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Save back to localStorage
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Success notification
      toast({
        title: "User Deleted",
        description: `User ${username} has been deleted successfully.`,
      });
      
      // Call callback
      onUserDeleted();
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the user <span className="font-bold">{username}</span>. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            className="bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const EditAssignmentModal = ({ assignment, onClose, onAssignmentUpdated }) => {
  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description);
  const [dueDate, setDueDate] = useState(assignment.dueDate.split("T")[0]);
  const [status, setStatus] = useState(assignment.status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:9000/teacher/assignments/${assignment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate, status }),
      });

      if (!response.ok) throw new Error("Failed to update assignment");

      toast.success("Assignment updated successfully!");
      onAssignmentUpdated(); // Refresh assignments
      onClose();
    } catch (error) {
      toast.error("Error updating assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 py-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />

          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />

          <Label>Due Date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <Label>Status</Label>
          <Input value={status} onChange={(e) => setStatus(e.target.value)} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

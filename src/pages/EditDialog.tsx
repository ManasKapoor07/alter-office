import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Replace with your Firestore instance

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  status: string;
}

const EditTaskDialog = ({ isOpen, onClose, taskId, onUpdate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Task Data from Firestore
  useEffect(() => {
    if (taskId && isOpen) {
      const fetchTask = async () => {
        try {
          setLoading(true);
          const taskRef = doc(db, "tasks", taskId); // Adjust Firestore path as needed
          const taskSnapshot = await getDoc(taskRef);

          if (taskSnapshot.exists()) {
            const taskData = taskSnapshot.data();
            setTask({
              id: taskSnapshot.id,
              title: taskData.title,
              description: taskData.description,
              category: taskData.category,
              dueDate: taskData.dueDate,
              status: taskData.status,
            });
          } else {
            setError("Task not found");
          }
        } catch (err) {
          console.error("Failed to fetch task:", err);
          setError("Failed to fetch task");
        } finally {
          setLoading(false);
        }
      };

      fetchTask();
    }
  }, [taskId, isOpen]);

  // Handle Update Task
  const handleUpdate = async () => {
    if (!task) return;

    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        title: task.title,
        description: task.description,
        category: task.category,
        dueDate: task.dueDate,
        status: task.status,
      });

      onUpdate(task);
      onClose();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to update task");
    }
  };

  if (!isOpen) return null;

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center  bg-opacity-25">
        <div className="text-white">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="fixed inset-0 flex items-center justify-center=bg-opacity-25">
        <div className="text-red-500">{error}</div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            className="text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-3 gap-6">
          {/* Title */}
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={task?.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={task?.description}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Category
            </label>
            <select
              value={task?.category}
              onChange={(e) => setTask({ ...task, category: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={task?.dueDate}
              onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Task Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Status
            </label>
            <select
              value={task?.status}
              onChange={(e) => setTask({ ...task, status: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskDialog;

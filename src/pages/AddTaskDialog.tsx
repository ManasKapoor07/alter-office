import React, { useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase"; // Make sure your firebase.ts is correctly set up
import { collection, addDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchTasks } from "../store/taskSlice";


interface AddTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Task {
    title: string;
    description: string;
    category: string;
    dueDate: string;
    status: string;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Work");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("");

    const handleCreateTask = async () => {
        if (!title.trim() || !status) {
            alert("Title and Status are required!");
            return;
        }

        // Prepare the task object
        const newTask: Task = {
            title,
            description,
            category,
            dueDate,
            status,
        };

        try {
            // Add new task to Firestore
            const docRef = await addDoc(collection(db, "tasks"), newTask);
            console.log(newTask);
            
            console.log("Task added with ID: ", docRef.id);
            dispatch(fetchTasks())
            onClose(); // Close the modal
            resetForm(); // Reset form after submission
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("Work");
        setDueDate("");
        setStatus("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-100/40 bg-opacity-50 flex justify-center items-center z-50">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 w-[500px] max-w-full"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Create Task</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none text-2xl"
                    >
                        &times;
                    </button>
                </div>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Task title"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Description"
                        className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength={300}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 border rounded-full text-sm font-medium focus:outline-none ${
                                    category === "Work" ? "bg-gray-300" : "bg-gray-200"
                                }`}
                                onClick={() => setCategory("Work")}
                            >
                                Work
                            </button>
                            <button
                                className={`px-4 py-2 border rounded-full text-sm font-medium focus:outline-none ${
                                    category === "Personal" ? "bg-gray-300" : "bg-gray-200"
                                }`}
                                onClick={() => setCategory("personal")}
                            >
                                Personal
                            </button>
                        </div>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">Task Status</option>
                        <option value="todo">Todo</option>
                        <option value="inProgress">In-Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">Attachment</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                            Drop your files here or <span className="text-purple-500 cursor-pointer">Update</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateTask}
                        className="px-6 py-2 bg-purple-500 text-white rounded-lg focus:outline-none hover:bg-purple-600"
                    >
                        Create
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AddTaskDialog;

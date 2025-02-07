import React, { useState } from "react";
import { motion, time } from "framer-motion";
import { db, storage } from "../firebase"; // Import storage
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchTasks } from "../store/taskSlice";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';


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
    order: number;
    activity: [];
    attachmentUrl?: string; // Add attachment URL field
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("work");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);


    const supabase = createClient("https://buwlbydemiluyxcpybrk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1d2xieWRlbWlsdXl4Y3B5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NTU2MjcsImV4cCI6MjA1NDMzMTYyN30.y68vY5KG_FoLBI42t7tcgySyrCBRm5qPW3PSn_zcHPM");

    const handleCreateTask = async () => {
        if (!title.trim() || !status) {
            alert("Title and Status are required!");
            return;
        }

        let attachmentUrl = "";
        setUploading(true);

        try {
            if (file) {
                // Generate unique file name with timestamp
                const uniqueFileName = `${Date.now()}_${uuidv4()}_${file.name}`;
                const filePath = `attachments/${uniqueFileName}`;

                // Upload file to Supabase Storage
                const { data, error } = await supabase.storage.from("todo").upload(filePath, file);

                if (error) throw new Error("File upload failed: " + error.message);

                // Retrieve public URL
                attachmentUrl = supabase.storage.from("todo").getPublicUrl(filePath).data.publicUrl;
                console.log("File uploaded:", attachmentUrl);
            }

            // Fetch the last order value in Firestore
            const tasksRef = collection(db, "tasks");
            const tasksSnapshot = await getDocs(tasksRef);
            const tasksList = tasksSnapshot.docs.map(doc => doc.data() as Task);
            const filteredTasks = tasksList.filter(task => task.status === status);
            const lastOrder = filteredTasks.length > 0 ? Math.max(...filteredTasks.map(task => task.order)) : 0;

            // Prepare task object
            const newTask: Task = {
                title,
                description,
                category,
                activity: [
                    {
                        DateTime: new Date().toISOString(),
                        desc: "You created this task",
                    },
                ],
                dueDate,
                status,
                attachmentUrl,
                order: lastOrder + 1,
            };

            // Save to Firestore
            const docRef = await addDoc(collection(db, "tasks"), newTask);
            console.log("Task added with ID:", docRef.id);

            // Optimistically update Redux store
            dispatch(fetchTasks());

            // Reset form & close modal
            resetForm();
            onClose();
        } catch (e) {
            console.error("Error adding task:", e);
            alert("Error creating task. Please try again.");
        } finally {
            setUploading(false);
        }
    };



    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("work");
        setDueDate("");
        setStatus("");
        setFile(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-100/40 bg-opacity-50 flex justify-center items-center z-50">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl"
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
                    <div className="md:flex justify-between items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">Type Category
                                <span className="">*</span>
                            </label>
                            <div className="flex gap-2 md:mb-0 mb-4">
                                <button
                                    className={`px-4 py-2 border rounded-full text-sm font-medium focus:outline-none ${category === "work" ? "bg-[#7B1984] text-white" : ""
                                        }`}
                                    onClick={() => setCategory("work")}
                                >
                                    Work
                                </button>
                                <button
                                    className={`px-4 py-2 border rounded-full text-sm font-medium focus:outline-none ${category === "personal" ? "bg-[#7B1984] text-white" : ""
                                        }`}
                                    onClick={() => setCategory("personal")}
                                >
                                    Personal
                                </button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">Due on
                                <span className="">*</span>
                            </label>
                            <input
                                type="date"
                                className="border md:mb-0 mb-4 w-60 md:w-full border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                Task Status
                                <span className="">*</span>
                            </label>
                            <select
                                className=" border md:mb-0 mb-4 w-60 md:w-full border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">Task Status</option>
                                <option value="todo">Todo</option>
                                <option value="inProgress">In-Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <input
                            type="file"
                            id="add-file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="border border-gray-300 hidden rounded-lg p-3 w-full"
                        />
                        <label
                            className="block text-sm text-gray-600 mb-2">Attachment</label>
                        <label
                            htmlFor="add-file"
                            className="h-14 bg-[#F1F1F1]/30 rounded-b-md text-center flex justify-center items-center">
                            Drop your files here or <span className="text-[#2956DD] underline ml-1 cursor-pointer"> Update</span>
                        </label>
                        {file && (
                            <p className="text-sm text-gray-500 mt-1">
                                Selected file: {file.name}
                            </p>
                        )}
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
                        disabled={uploading}
                        className={`px-6 py-2 rounded-lg focus:outline-none ${uploading ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600 text-white"
                            }`}
                    >
                        {uploading ? "Uploading..." : "Create"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AddTaskDialog;

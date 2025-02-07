import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Replace with your Firestore instance
import { Cross1Icon } from "@radix-ui/react-icons";
import { motion, time } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: string;
  status: string;
  activity: { DateTime: string; desc: string }[];
  attachmentUrl?: string;
}
const supabase = createClient("https://buwlbydemiluyxcpybrk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1d2xieWRlbWlsdXl4Y3B5YnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NTU2MjcsImV4cCI6MjA1NDMzMTYyN30.y68vY5KG_FoLBI42t7tcgySyrCBRm5qPW3PSn_zcHPM");


interface EditTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onUpdate: (task: Task) => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ isOpen, onClose, taskId, onUpdate }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("work");
  const [status, setStatus] = useState("");
  const [tempAttachment, setTempAttachment] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");


  useEffect(() => {
    if (taskId && isOpen) {
      const fetchTask = async () => {
        try {
          setLoading(true);
          const taskRef = doc(db, "tasks", taskId);
          const taskSnapshot = await getDoc(taskRef);

          if (taskSnapshot.exists()) {
            const taskData = taskSnapshot.data();
            console.log(task?.activity);

            setTask({
              id: taskSnapshot.id,
              title: taskData.title,
              activity: taskData.activity,
              description: taskData.description,
              category: taskData.category,
              dueDate: taskData.dueDate,
              status: taskData.status,
              attachmentUrl: taskData.attachmentUrl || "",
            });
            setTempAttachment(taskData.attachmentUrl || null);
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

  const handleFileUpload = async (file : any) => {
    if (!file || !task) return;
    setUploading(true);
    try {
      const uniqueFileName = `${uuidv4()}_${file.name}`;
      const filePath = `attachments/${uniqueFileName}`;
      const { data, error } = await supabase.storage.from("todo").upload(filePath, file);

      if (error) {
        console.error("File upload failed:", error.message);
        alert("File upload failed!");
        return;
      }

      const attachmentUrl = supabase.storage.from("todo").getPublicUrl(filePath).data.publicUrl;
      setTempAttachment(attachmentUrl);

      // Add activity log
      const newActivity = {
        DateTime: new Date().toISOString(),
        desc: "You uploaded a file",
      };
      setTask({
        ...task,
        activity: [...task.activity, newActivity],
      });
    } finally {
      setUploading(false);
    }
  };


  const handleUpdate = async () => {
    if (!task) return;

    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        title: task.title,
        description: task.description,
        activity: [
          ...(task.activity || []),
          {
            DateTime: new Date().toISOString(),
            desc: "Task Updated",
          },
        ],
        category: category,
        dueDate: task.dueDate,
        status: status || task.status,
        attachmentUrl: tempAttachment || "",
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
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-25">
        <div className="text-white">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-25">
        <div className="text-red-500">{error}</div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-gray-100/40 bg-opacity-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-5xl max-w-xs" 
      >
        <div className="sm:hidden flex justify-around md:border-b border-none">
          <button
            className={`p-2 flex-1 ${activeTab === "details" ? " bg-black text-white rounded-3xl" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`p-2 flex-1 ${activeTab === "activity" ? "bg-black text-white rounded-3xl" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
        </div>
        <div className="p-6 relative flex flex-col sm:flex-row">
          <div className={`w-full md:w-2/3 pr-6 h-96 overflow-y-auto ${activeTab === "activity" ? "hidden sm:block" : ""}`}>

            {/* Left side - Task Details */}
            <div className="flex justify-between items-center mb-6">
              <button
                className="text-gray-500 hover:text-gray-800 absolute top-4 right-4"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-2">
              <div mx-6className="">
                {/* <label className="block text-sm font-medium text-gray-700">Title</label> */}
                <input
                  type="text"
                  value={task?.title}
                  onChange={(e) => setTask({ ...task!, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                {/* <label className="block text-sm font-medium text-gray-700">Description</label> */}
                <textarea
                  value={task?.description}
                  onChange={(e) => setTask({ ...task!, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:flex justify-between items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm  font-medium text-gray-700 mb-2">Type Category
                    <span className="">*</span>

                  </label>
                  <div className="flex gap-2 ">
                    <button
                      className={`px-4 py-2 border cursor-pointer border-gray-300 rounded-full text-sm font-medium focus:outline-none ${category === "work" ? "bg-[#7B1984] text-white" : ""
                        }`}
                      onClick={() => setCategory("work")}
                    >
                      Work
                    </button>
                    <button
                      className={`px-4 py-2 border cursor-pointer border-gray-300 rounded-full text-sm font-medium focus:outline-none ${category === "personal" ? "bg-[#7B1984] text-white" : ""
                        }`}
                      onClick={() => setCategory("personal")}
                    >
                      Personal
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium  text-gray-700 mb-2">Due on
                    <span className="">*</span>
                  </label>
                  <input
                    type="date"
                    value={task?.dueDate}
                    onChange={(e) => setTask({ ...task!, dueDate: e.target.value })}
                    className="w-52 md:w-full  p-2 border border-gray-300 bg-[#F1F1F1]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Status
                    <span className="">*</span>
                  </label>
                  <select
                    className="w-52 md:w-full border border-gray-300 bg-[#F1F1F1]/30 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Upload Attachment</h3>
                <div>
                  <input
                    type="file" onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    id="add-file"
                    className="border border-gray-300 hidden rounded-lg p-3 w-full"
                  />
                  <label
                    className="block text-sm text-gray-600 mb-2">Attachment</label>
                  <label
                    htmlFor="add-file"
                    className="h-10 bg-[#F1F1F1]/30 text-[12px] md:text-[16px] rounded-b-md text-center flex justify-center items-center">
                    Drop your files here or <span className="text-[#2956DD] underline ml-1 cursor-pointer"> Update</span>
                  </label>

                </div>
                {/* <input type="file" onChange={(e) => handleFileUpload(e.target.files?.[0])} className="w-full border p-2 rounded-lg" disabled={uploading} /> */}
              </div>
              {tempAttachment && (
                <div className="mt-6 border-t pt-4 relative ">
                  <h3 className="text-lg font-semibold mb-2">Attachment</h3>
                  <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1" onClick={() => setTempAttachment(null)}>
                    <Cross1Icon />
                  </button>
                  {tempAttachment.endsWith(".pdf") ? (
                    <iframe src={tempAttachment} className="w-full h-40" title="PDF Attachment"></iframe>
                  ) : (
                    <img src={tempAttachment} alt="Attachment" className="w-full max-h-40 object-contain rounded-lg" />
                  )}
                </div>
              )}
            </div>

          </div>

          <div className={`w-full sm:w-1/3 px-6 h-96 overflow-y-auto ${activeTab === "details" ? "hidden sm:block" : ""}`}>
            <h3 className="text-lg font-semibold mb-2">Activity Logs</h3>
            {task?.activity && task.activity.length > 0 ? (
              <ul className="space-y-2">
                {task.activity.map((log, index) => (
                  <li
                    key={index}
                    className="p-3  flex justify-between items-start"
                  >
                    <div className="flex justify-between items-center w-full">
                      <p className="text-gray-800 text-sm font-medium">{log.desc}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(log.DateTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(log?.DateTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-600 text-sm">
                No activity logs available for this task.
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end p-6 gap-4 text-[14px] font-semibold cursor-pointer">
          <button
            onClick={onClose}
            className="px-4 py-2 cursor-pointer rounded-3xl bg-gray-200  hover:bg-gray-300">Cancel</button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded-3xl cursor-pointer bg-[#7B1984] text-white  ">Update</button>
        </div>
      </motion.div>
    </div>



  );
};

export default EditTaskDialog;

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion } from "framer-motion";
import { format } from "date-fns";

import AddTaskDialog from "./AddTaskDialog";
import taskSrc from '../assets/task_icon.svg'
import listSrc from '../assets/list_icon.svg'
import boardSrc from '../assets/board.svg'
import { ChevronDownIcon, ChevronUpIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import dragSrc from '../assets/drag_icon.svg'
import enerSrc from '../assets/enter.svg'

interface User {
    displayName: string;
    photoUrl: string;
}

interface Task {
    id: string;
    description: string;
    status: string;
    order: number;
}

const TaskManager: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isdialoag, setisdialoag] = useState(false)
    const [activeTab, setActiveTab] = useState<"list" | "board">("list");
    const navigate = useNavigate();

    useEffect(() => {
        auth.onAuthStateChanged((currentUser) => {
            if (!currentUser) {
                navigate("/");
            } else {
                setUser(currentUser);
            }
        });
    }, [navigate]);


    const fetchTasks = async () => {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        const fetchedTasks: Task[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            description: doc.data().description,
            status: doc.data().status,
            date: doc.data().date ? format(new Date(doc.data().date), "dd MMM, yyyy") : "Today", // Format date
            order: doc.data().order || 0,
        }));
        setTasks(fetchedTasks.sort((a, b) => a.order - b.order));
    };


    useEffect(() => {
        fetchTasks();
    }, []);

    const moveTask = async (taskId: string, newStatus: string, newIndex: number) => {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { status: newStatus, order: newIndex });

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus, order: newIndex } : task
            ).sort((a, b) => a.order - b.order)
        );
    };

    return (
        <><DndProvider backend={HTML5Backend}>
            <div className="h-screen w-full p-4">
                <div className="flex items-center justify-between bg-white p-4">
                    <div className="flex">
                        <img src={taskSrc} alt="" />
                        <h1 className="text-[24px] font-semibood">TaskBuddy</h1>
                    </div>
                    {user && (
                        <div className="flex items-center gap-3">
                            <img src={user?.photoUrl} alt="Profile" className="w-10 h-10 rounded-full border" />
                            <span className="text-gray-700">{user.displayName}</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex justify-start gap-2 p-4">
                    <button
                        className={`px-2 py-2 rounded  text-[16px] ${activeTab === "list" ? "font-bold  text-black" : ""}`}
                        onClick={() => setActiveTab("list")}
                    >
                        <div className="flex items-center">
                            <img src={listSrc} alt="list" className="size-6" />
                            List View
                        </div>
                    </button>
                    <button
                        className={`px-2 py-2 rounded text-[16px] ${activeTab === "board" ? "font-bold text-black" : ""}`}
                        onClick={() => setActiveTab("board")}
                    >
                        <div className="flex items-centerC ">
                            <img src={boardSrc} alt="board" className="size-6" />

                            Board View
                        </div>
                    </button>
                </div>

                {/* Views */}
                {activeTab === "list" ? (
                    <TaskListView tasks={tasks} moveTask={moveTask} />
                ) : (
                    <TaskBoardView tasks={tasks} moveTask={moveTask} />
                )}
            </div>
        </DndProvider>
        </>
    );
};

// ---------------------- LIST VIEW ----------------------
const TaskListView: React.FC<{ tasks: Task[]; moveTask: Function }> = ({ tasks, moveTask }) => {
    const groupedTasks = {
        todo: tasks.filter((task) => task.status === "todo").sort((a, b) => a.order - b.order),
        inProgress: tasks.filter((task) => task.status === "inProgress").sort((a, b) => a.order - b.order),
        completed: tasks.filter((task) => task.status === "completed").sort((a, b) => a.order - b.order),
    };

    return (
        <div className="w-full mx-auto p-4">
            {Object.entries(groupedTasks).map(([key, taskList]) => (
                <TaskSection
                    key={key}
                    title={key === "todo" ? "Todo" : key === "inProgress" ? "In Progress" : "Completed"}
                    tasks={taskList}
                    status={key}
                    moveTask={moveTask}
                />
            ))}
        </div>
    );
};

// ---------------------- BOARD VIEW ----------------------
const TaskBoardView: React.FC<{ tasks: Task[]; moveTask: Function }> = ({ tasks, moveTask }) => {
    const groupedTasks = {
        todo: tasks?.filter((task) => task.status === "todo").sort((a, b) => a.order - b.order),
        inProgress: tasks?.filter((task) => task.status === "inProgress").sort((a, b) => a.order - b.order),
        completed: tasks?.filter((task) => task.status === "completed").sort((a, b) => a.order - b.order),
    };

    return (
        <div className="flex justify-center gap-4 p-4">
            {Object.entries(groupedTasks).map(([key, taskList]) => (
                <TaskSection
                    key={key}
                    title={key === "todo" ? "Todo" : key === "inProgress" ? "In Progress" : "Completed"}
                    tasks={taskList}
                    status={key}
                    moveTask={moveTask}
                    isBoardView
                />
            ))}
        </div>
    );
};

const sectionColors: { [key: string]: string } = {
    "Todo": "bg-[#FAC3FF]",
    "In Progress": "bg-[#85D9F1]",
    "Completed": "bg-[#C3FFC3]",
};

const TaskSection: React.FC<{
    title: string;
    tasks: Task[];
    status: string;
    moveTask: Function;
    isBoardView?: boolean;
}> = ({ title, tasks, status, moveTask, isBoardView = false }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", date: "", status: "todo", category: "" });

    const [{ isOver }, drop] = useDrop({
        accept: "TASK",
        drop: (item: { id: string }) => {
            moveTask(item.id, status, tasks.length);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    const handleAddTask = async () => {
        if (!newTask.title) return alert("Task title is required!");

        try {
            const docRef = await addDoc(collection(db, "tasks"), {
                description: newTask.title,
                date: newTask.date,
                status: newTask.status,
                category: newTask.category,
                createdAt: new Date(),
            });

            console.log("Task added to Firestore with ID:", docRef.id);
            setShowTaskForm(false);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    return (
        <div ref={drop} className={`rounded-lg ${isOver ? "bg-gray-200" : "bg-gray-100"} ${isBoardView ? "w-64" : "mb-6"}`}>
            <div
                className={`p-3 rounded text-center font-bold flex justify-between items-center cursor-pointer ${sectionColors[title] || "bg-gray-300"}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title}</span>
                {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </div>

            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="mt-2">
                    {status === "todo" && (
                        <><button
                            className="p-2 px-6 text-black font-medium text-[14px] w-full text-left"
                            onClick={() => setShowTaskForm(!showTaskForm)}
                        >
                            <div className="items-center flex gap-2">
                                <span className="text-[18px] text-[#7B1984]">+</span>
                                Add Task
                            </div>
                        </button><hr className="border-gray-300" /></>
                    )}

                    {showTaskForm && (
                        <div className="p-4 mt-2">
                            <div className="flex justify-between mt-2">
                                <input
                                    type="text"
                                    placeholder="Task Title"
                                    className="w-40 p-2  rounded mt-2"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="p-2  rounded"
                                    value={newTask.date}
                                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                                />
                                <select
                                    className="p-2 borer rounded"
                                    value={newTask.status}
                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                >
                                    <option value="todo">To-Do</option>
                                    <option value="inProgress">In-Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <select
                                    className="p-2 rounded"
                                    value={newTask.category}
                                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                                >
                                    <option value="work">Work</option>
                                    <option value="personal">Personal</option>
                                </select>
                            </div>
                            <div className="flex justify-baseline gap-2 mt-3">
                                <button className="bg-[#7B1984] text-white px-4 py-2 rounded-3xl w-[84px]" onClick={handleAddTask}>
                                    <div className="flex items-center gap-3">
                                        Add
                                        <img src={enerSrc} />
                                    </div>
                                </button>
                                <button className=" px-4 py-2 text-[16px] font-bold" onClick={() => setShowTaskForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {tasks.length > 0 ? (
                        tasks.map((task, index) => (
                            <DraggableTask key={task.id} task={task} index={index} moveTask={moveTask} />
                        ))
                    ) : (
                        <div className="text-center text-gray-500">No data in {title}</div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};



const DraggableTask: React.FC<{ task: Task; index: number; moveTask: Function }> = ({ task, index, moveTask }) => {
    const [{ isDragging }, drag] = useDrag({
        type: "TASK",
        item: { id: task.id, index },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({
        description: task.description,
        status: task.status,
        category: "work",
    });

    const handleUpdate = async () => {
        const taskRef = doc(db, "tasks", task.id);
        await updateDoc(taskRef, {
            description: editedTask.description,
            status: editedTask.status,
            category: editedTask.category,
        });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await deleteDoc(doc(db, "tasks", task.id));
        moveTask(task.id, "", -1);
    };

    const [status, setStatus] = useState(task.status);
    const taskRef = doc(db, "tasks", task.id); // Reference to the document

    const toggleStatus = async () => {
        const newStatus = status === "todo" ? "inProgress" : status === "inProgress" ? "completed" : "todo";

        try {
            await updateDoc(taskRef, { status: newStatus });
            setStatus(newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    // Map Firestore status values to display labels
    const statusLabels = {
        todo: "TO-DO",
        inProgress: "IN-PROGRESS",
        completed: "COMPLETED",
    };

    return (
        <motion.div
            ref={drag}
            className={`p-3 rounded cursor-pointer flex items-center gap-4 w-full ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
            {isEditing ? (
                <div className="flex items-center justify-between w-full">
                    <input
                        type="text"
                        value={editedTask.description}
                        onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                        className="p-1 border rounded w-1/3"
                    />
                    <select
                        value={editedTask.status}
                        onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                        className="p-1 border rounded w-1/4"
                    >
                        <option value="todo">To-Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <div className="flex gap-2">
                        <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={handleUpdate}>
                            Save
                        </button>
                        <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center w-full">
                    <span className="w-1/3 truncate">{task.description}</span>
                    <span className="w-1/4 text-center">{task?.date}</span>
                    <span
                        className="w-52 text-center bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300"
                        onClick={toggleStatus}
                    >
                        {statusLabels[status] || status}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)}>
                            <Pencil1Icon />
                        </button>
                        <button onClick={handleDelete} className="text-red-500">
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};



export default TaskManager;

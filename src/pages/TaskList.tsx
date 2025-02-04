import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { collection, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion } from "framer-motion";
import { Menu, MenuItem, IconButton, Select } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAuth, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../store/taskSlice";
import { RootState, AppDispatch } from "../store/store";
import taskSrc from '../assets/task_icon.svg'
import listSrc from '../assets/list_icon.svg'
import boardSrc from '../assets/board.svg'
import { ChevronDownIcon, ChevronUpIcon, DotsHorizontalIcon, MagnifyingGlassIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import dragSrc from '../assets/drag_icon.svg'
import logoutSrc from '../assets/logout_icon.svg'
import checkmark from '../assets/checkmark.svg'
import greenCheckmark from '../assets/greencheckmark.svg'



import enerSrc from '../assets/enter.svg'
import { Link } from "react-router-dom";
import AddTaskDialog from "./AddTaskDialog";
import EditTaskDialog from "./EditDialog";

interface User {
    displayName: string;
    photoUrl: string;
}

interface Task {
    id: string;
    description: string;
    title: string;
    date: string;
    category: string;
    status: string;
    order: number;
}


//---------------TaskManager--------------------
const TaskManager: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
    const [user, setUser] = useState<User | null>(null);
    const [isdialoag, setisdialoag] = useState(false);

    const { tab } = useParams<{ tab: string }>();
    const navigate = useNavigate();
    const auth = getAuth();

    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (!currentUser) {
                navigate("/");
            } else {
                setUser({
                    displayName: currentUser.displayName || "User",
                    photoUrl: currentUser.photoURL || "",
                });
            }
        });

        return () => unsubscribe(); // Cleanup listener
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    useEffect(() => {
        dispatch(fetchTasks({ categoryFilter, dateFilter }));
    }, [categoryFilter, dateFilter, dispatch]);

    const moveTask = async (taskId: string, newStatus: string, newIndex: number) => {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { status: newStatus, order: newIndex });
        dispatch(fetchTasks({ categoryFilter, dateFilter }));
    };

    const handleDialogOpen = () => {
        setisdialoag(true);
    };

    const activeTab = tab === "board" ? "board" : "list";

    // 🔎 **Filter tasks based on search query**
    const filteredTasks = tasks.filter((task) =>
        task?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task?.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task?.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log(searchQuery);


    return (
        <><DndProvider backend={HTML5Backend}>
            <div className="h-screen w-full p-4">
                <div className="flex items-center justify-between bg-white p-4">
                    <div className="flex">
                        <img src={taskSrc} alt="Task Manager Logo" />
                        <h1 className="text-[24px] font-semibold">TaskBuddy</h1>
                    </div>
                    {user && (
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.photoUrl}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border" />
                            <span className="text-gray-700">{user.displayName}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end px-4">
                    <button onClick={handleLogout}>
                        <div className="flex items-center gap-2 bg-[#FFF9F9] px-4 py-2 rounded-2xl border border-[#7B1984]/10">
                            <img src={logoutSrc} />
                            Logout
                        </div>
                    </button>
                </div>

                {/* 🔎 **Search Input Field** */}
                <div className="items-center flex gap-2 justify-end my-3 px-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute size-6 bottom-0 top-2 left-2 text-gray-500" />
                        <input
                            className="w-60 h-10 border border-gray-400 rounded-3xl px-9 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Search tasks..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleDialogOpen}
                        className="bg-[#7B1984] py-2 px-6 cursor-pointer z-10 rounded-4xl text-white text-[14px]">
                        Add Task
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex justify-start gap-2 p-3 -mt-28">
                    <Link
                        to="/tasks/list"
                        className={`px-2 py-2 rounded text-[16px] ${activeTab === "list" ? "font-bold text-black" : ""}`}
                    >
                        <div className="flex items-center">
                            <img src={listSrc} alt="list" className="size-6" />
                            List
                        </div>
                    </Link>
                    <Link
                        to="/tasks/board"
                        className={`px-2 py-2 rounded text-[16px] ${activeTab === "board" ? "font-bold text-black" : ""}`}
                    >
                        <div className="flex items-center">
                            <img src={boardSrc} alt="board" className="size-6" />
                            Board
                        </div>
                    </Link>
                </div>

                <div className="flex flex-col mb-3 px-4">
                    <div className="gap-4 flex items-center">
                        <span>Filter by:</span>
                        <select onChange={(e) => setCategoryFilter(e.target.value)} className="p-3 w-32 rounded-3xl border border-gray-200">
                            <option value="">Category</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                        </select>
                        <select onChange={(e) => setDateFilter(e.target.value)} className="p-3 w-32 rounded-3xl border border-gray-200">
                            <option value="">Due Date</option>
                            <option value="today">Today</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-400 opacity-10 h-0.5 w-full my-4" />

                {/* 🔹 Render Filtered Tasks in List or Board View */}
                {activeTab === "list" ? (
                    <TaskListView tasks={filteredTasks} moveTask={moveTask} />
                ) : (
                    <TaskBoardView tasks={filteredTasks} moveTask={moveTask} />
                )}

            </div>
        </DndProvider>
            <AddTaskDialog isOpen={isdialoag} onClose={() => setisdialoag(false)} /></>
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
        <div className="w-full mx-auto h-full ">
            {Object.entries(groupedTasks).map(([key, taskList]) => (
                <TaskSection
                    key={key}
                    title={key === "todo" ? "To-Do" : key === "inProgress" ? "In Progress" : "Completed"}
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
        <div className="flex w-full gap-4 ">
            {Object.entries(groupedTasks).map(([key, taskList]) => (
                <TaskSection
                    key={key}
                    title={key === "todo" ? "To-Do" : key === "inProgress" ? "In Progress" : "Completed"}
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
    "To-Do": "bg-[#FAC3FF]",
    "In Progress": "bg-[#85D9F1]",
    "Completed": "bg-[#C3FFC3]",
};

//-------------Task Section-----------------
const TaskSection: React.FC<{
    title: string;
    tasks: Task[];
    status: string;
    moveTask: Function;
    isBoardView?: boolean;
}> = ({ title, tasks, status, moveTask, isBoardView = false }) => {
    const [sectionOpen, setSectionOpen] = useState<{ [key: string]: boolean }>({
        todo: true,
        inProgress: true,
        completed: true
    });

    const toggleSection = (section: string) => {
        setSectionOpen((prev) => {
            const newState = { ...prev, [section]: !prev[section] };
            return newState;
        });
    };
    const dispatch = useDispatch<AppDispatch>();
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
                title: newTask.title,
                date: newTask.date,
                status: newTask.status,
                category: newTask.category,
                createdAt: new Date(),
            });

            setShowTaskForm(false);
            setNewTask({ title: "", date: "", status: "todo", category: "" });
            dispatch(fetchTasks())
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);


    return (
        <div ref={drop}
            className={`rounded-t-2xl  flex flex-col  ${isOver ? "bg-white" : "bg-[#F1F1F1]"} ${isBoardView ? "w-[27%]  h-fit " : "mb-6"}`}>
            <div
                className={`p-2 z-10 rounded-t-2xl font-bold flex justify-between cursor-pointer ${!isBoardView ? sectionColors[title] : 'bg-[#F1F1F1]'}`}
                onClick={() => {
                    toggleSection(status)
                }}
            >
                <span
                    className={`p-2 rounded-md font-medium ${isBoardView ? sectionColors[title] : ''}`}>{title}</span>
                {sectionOpen[status] ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </div>
            <motion.div
                initial={{ maxHeight: 0, opacity: 0 }}
                animate={{ maxHeight: sectionOpen[status] ? 600 : 0, opacity: sectionOpen[status] ? 1 : 0 }}
                exit={{ maxHeight: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-visible"
            >

                <div className="mt-2 flex flex-col justify-center items-center ">
                    {(status === "todo" && !isBoardView) && (
                        <><button
                            className="p-2 px-6 text-black font-medium text-[14px] w-full text-left"
                            onClick={() => setShowTaskForm(!showTaskForm)}
                        >
                            <div className="items-center flex gap-2">
                                <span className="text-[18px] text-[#7B1984]">+</span>
                                Add Task
                            </div>
                        </button>
                            <div className="bg-gray-400 opacity-10 h-0.5 w-full" />
                        </>
                    )}
                    {showTaskForm && (
                        <div className="p-4 mt-2 flex flex-col w-full">
                            <div className="flex justify-between mt-2">
                                <input
                                    type="text"
                                    placeholder="Task Title"
                                    className="w-40 p-2 mt-2"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />

                                <input
                                    type="date"
                                    className="p-2"
                                    value={newTask.date}
                                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                                />

                                <div className="relative">
                                    <button
                                        className="p-2 rounded"
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    >
                                        <PlusCircledIcon className="size-5" />
                                        <div className="uppercase">
                                            {newTask.status ? newTask.status : ""}
                                        </div>
                                    </button>
                                    {showStatusDropdown && (
                                        <div className="absolute left-0 mt-2 w-32 bg-white border rounded shadow-lg">
                                            {["todo", "inProgress", "completed"].map((status) => (
                                                <button
                                                    key={status}
                                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    onClick={() => {
                                                        setNewTask({ ...newTask, status });
                                                        setShowStatusDropdown(false);
                                                    }}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        className="p-2"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    >
                                        <PlusCircledIcon className="size-5" />
                                        <div className="uppercase">
                                            {newTask.category ? newTask.category : ""}
                                        </div>
                                    </button>
                                    {showCategoryDropdown && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg">
                                            {["work", "personal"].map((category) => (
                                                <button
                                                    key={category}
                                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                                    onClick={() => {
                                                        setNewTask({ ...newTask, category });
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                >
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-baseline gap-2 mt-3">
                                <button className="bg-[#7B1984] text-white px-4 py-2 rounded-3xl" onClick={handleAddTask}>
                                    <div className="flex gap-2">
                                        Add
                                        <img src={enerSrc} />
                                    </div>
                                </button>
                                <button className="px-4 py-2 text-[16px] font-bold" onClick={() => setShowTaskForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {tasks.length > 0 ? (
                        tasks.map((task, index) => (
                            <div key={task.id} className="flex justify-center w-full h-full flex-col">
                                <div className="flex items-center ml-2 ">

                                    <DraggableTask key={task.id} task={task} index={index} moveTask={moveTask} />
                                </div>
                                {!isBoardView && <div className="bg-gray-400 opacity-10 h-0.5 w-full" />}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 my-10 h-60 flex justify-center items-center">
                            No data in {title}
                        </div>
                    )}

                </div>
            </motion.div>
        </div >
    );
};

//-----------------DraggableTask--------------------
const DraggableTask: React.FC<{ task: Task; index: number; moveTask: Function }> = ({ task, index, moveTask }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [{ isDragging }, drag] = useDrag({
        type: "TASK",
        item: { id: task.id, index },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const [isEditing, setIsEditing] = useState(false);
    const { tab } = useParams<{ tab: string }>();
    const [editedTask, setEditedTask] = useState({
        description: task.description,
        status: task.status,
        category: "work",
    });

    const handleUpdate = async () => {
        const taskRef = doc(db, "tasks", task.id);
        setIsEditing(false);
        dispatch(fetchTasks())
    };

    const handleDelete = async () => {
        await deleteDoc(doc(db, "tasks", task.id));
        moveTask(task.id, "", -1);
        dispatch(fetchTasks())

    };

    const [status, setStatus] = useState(task.status);
    const taskRef = doc(db, "tasks", task.id);

    const statusLabels = {
        todo: "TO-DO",
        inProgress: "IN-PROGRESS",
        completed: "COMPLETED",
    };

    const handleChange = async (event: { target: { value: any; }; }) => {
        const newStatus = event.target.value;

        try {
            await updateDoc(taskRef, { status: newStatus });
            setStatus(newStatus);
            dispatch(fetchTasks())
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isOpen = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    // const handleUpdate = (updatedTask) => {
    //     console.log("Updated Task:", updatedTask);
    //     // Perform any further action, such as re-fetching tasks
    // };
    return (
        <motion.div
            ref={drag}
            className={`p-2 rounded cursor-pointer   ${tab === 'board' ? ' items-baseline ' : 'gap-4 items-center'} flex   w-full ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
            {(
                tab === 'list' ?

                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                // checked={task.completed}
                                // onChange={() => toggleTaskCompletion(task.id)}
                                className="h-4 w-4 mr-2 cursor-pointer"
                            />
                            {
                                task.status === 'completed' ?
                                    <img src={greenCheckmark} className="h-6 w-6" />
                                    :
                                    <img src={checkmark} className="h-6 w-6" />
                            }
                            <img src={dragSrc} className="h-6 w-6" />
                        </div>
                        <span className={`${task.status === 'completed' ? 'line-through' : ''} w-1/3 `}>{task?.title}</span>
                        <span className="w-1/4">{task?.date}</span>
                        <Select
                            value={status}
                            onChange={handleChange}
                            IconComponent={() => null}
                            className=" bg-gray-200 p-2 h-8 rounded cursor-pointer border border-none"
                        >
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <MenuItem className="text-base" key={key} value={key}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                        <span className="w-1/4 text-center uppercase">{task?.category}</span>

                        <div>
                            <IconButton onClick={handleClick}>
                                <DotsHorizontalIcon />
                            </IconButton>

                            <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
                                <MenuItem
                                    onClick={() => {
                                        setIsEditing(true);
                                        handleClose();
                                    }}
                                >
                                    <EditIcon className="" sx={{ marginRight: 1 }} />
                                    Edit
                                </MenuItem>

                                <MenuItem
                                    onClick={() => {
                                        handleDelete();
                                        handleClose();
                                    }}
                                >
                                    <DeleteIcon width={'10px'} color={"error"} sx={{ marginRight: 1 }} />
                                    Delete
                                </MenuItem>
                            </Menu>
                        </div>

                    </div>
                    :
                    <><div className="bg-white flex flex-col w-full p-2 rounded-lg h-30">
                        <div className="flex justify-between items-center">
                            <span className={`${task.status === 'completed' ? 'line-through' : ''} w-1/3 ml-2 truncate`}>{task.title}</span>
                            <div>
                                <IconButton onClick={handleClick}>
                                    <DotsHorizontalIcon />
                                </IconButton>

                                <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
                                    <MenuItem
                                    className=""
                                        onClick={() => {
                                            setIsEditing(true);
                                        }}
                                    >
                                        <EditIcon className="" sx={{ marginRight: 1 }} />
                                        Edit
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            handleDelete();
                                            handleClose();
                                        }}
                                    >
                                        <DeleteIcon width={'10px'} color={"error"} sx={{ marginRight: 1 }} />
                                        Delete
                                    </MenuItem>
                                </Menu>
                            </div>
                        </div>
                        <div className="flex justify-between items-end h-full">
                            <span className="w-1/4  text-[14px] font-medium text-black opacity-40">{task?.category}</span>
                            <span className="w-1/4  text-[14px] font-medium text-black opacity-40">{task?.date}</span>
                        </div>
                    </div>
                        <EditTaskDialog isOpen={isEditing} onClose={() => setIsEditing(false)}  onUpdate={handleUpdate} taskId={task.id}/></>
            )}
        </motion.div>
    );
};

export default TaskManager;

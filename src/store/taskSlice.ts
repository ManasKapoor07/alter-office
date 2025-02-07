import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { format, isToday } from "date-fns";

// Define Task Type
interface Task {
    title: any;
    id: string;
    description: string;
    dueDate: string;
    status: string;
    category: string;
    order: number;
    activity : [];
}

// Initial State
interface TaskState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: TaskState = {
    tasks: [],
    loading: false,
    error: null,
};

// Fetch Tasks with optional filters
export const fetchTasks = createAsyncThunk<Task[], { categoryFilter?: string; dateFilter?: string } | undefined>(
    "tasks/fetchTasks",
    async (filters = {}) => {
        const { categoryFilter, dateFilter } = filters;
        let tasksRef = collection(db, "tasks");
        let q = query(tasksRef);

        // Apply category filter if provided
        if (categoryFilter) {
            q = query(q, where("category", "==", categoryFilter));
        }

        // Apply date filter if provided
        if (dateFilter) {
            const today = new Date();
            let startDate, endDate;

            if (dateFilter === "today") {
                startDate = new Date(today.setHours(0, 0, 0, 0));
                endDate = new Date(today.setHours(23, 59, 59, 999));
                console.log(startDate, endDate);

            } else if (dateFilter === "month") {
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            } else if (dateFilter === "year") {
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
            }

            q = query(q, where("date", ">=", startDate), where("date", "<=", endDate));
        }

        // Fetch tasks from Firestore
        const querySnapshot = await getDocs(q);
        const fetchedTasks: Task[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            // const formattedDate = data.dueDate
            //     ? format(new Date(data.dueDate), "dd MMM, yyyy")
            //     : format(new Date().toISOString().split("T")[0] , "dd MMM, yyyy");
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                status: data.status,
                category: data.category,
                dueDate: data.dueDate,
                order: data.order || 0,
                activity : data.activity
            };
        });
        return fetchedTasks;
    }
);

// Create Redux Slice
const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Error fetching tasks";
            });
    },
});

// Export the reducer
export default taskSlice.reducer;

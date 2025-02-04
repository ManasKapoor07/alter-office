import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./taskSlice";

export const store = configureStore({
    reducer: {
        tasks: taskReducer,
    },
});

// Define RootState & AppDispatch Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

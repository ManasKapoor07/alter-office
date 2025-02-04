import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TaskManager from "./pages/TaskList";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/tasks/:tab", // Dynamic route for tabs
    element: (

      <TaskManager />

    ),
  },
]);

export default router;

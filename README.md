TaskBuddy - Task Management Application

🚀 Overview

TaskBuddy is a responsive task management application built using Vite + React with TypeScript. It empowers users to efficiently create, organize, and track tasks while supporting user authentication with Firebase. Users can sign in with Google, create tasks, categorize them, set due dates, and organize them using a drag-and-drop Kanban board or a list view.

🎯 Features

1. User Authentication

Google Sign-In using Firebase Authentication.

User profile management.

2. Task Management

Create, edit, and delete tasks.

Categorize tasks (e.g., Work, Personal) and add tags.

Set due dates for tasks.

3. Drag & Drop Organization

Rearrange tasks within lists using react-beautiful-dnd.

4. Sorting & Filtering

Sort tasks by due date (ascending/descending).

Filter tasks by category, tags, and date range.

Search tasks by title.

5. Batch Actions

Mark multiple tasks as complete.

Delete multiple tasks at once.

6. Task History & Activity Log

Tracks all changes (creation, edits, deletions) with timestamps.

7. File Attachments

Upload and attach files to tasks using Supabase Storage.

8. Board/List View

Toggle between a Kanban board and a list view for better task management.

9. Responsive Design

Fully responsive design for mobile, tablet, and desktop.

🛠️ Tech Stack

Frontend: Vite + React + TypeScript

UI Components: Tailwind CSS, React Icons

State Management & Data Fetching: Redux

Authentication & Database: Firebase

File Storage: Supabase

Drag & Drop: react-beautiful-dnd

### 🏗 Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/ManasKapoor07/alter-office.git
cd taskbuddy
```
2 Install Dependencies
```
npm install
```
3 Run the Project
```
npm run dev
````
The app should now be running on http://localhost:5173/.

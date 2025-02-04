import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import taskSrc from "../assets/task.svg";

export default function LoginPage() {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            navigate("/tasks/list"); 
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-pink-50 p-6">
            <div className="w-full p-6">
                <h1 className="text-[26px] font-bold text-[#7B1984] flex items-center gap-2">
                    <img src={taskSrc} className="w-[32px] h-[32px]" /> TaskBuddy
                </h1>
                <p className="mt-2 text-gray-600 w-md">
                    Streamline your workflow and track progress effortlessly with our all-in-one task management app.
                </p>
                <button
                    onClick={handleGoogleLogin}
                    className="mt-6 flex w-64 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-black p-3 text-white shadow-lg hover:bg-gray-900"
                >
                    <FcGoogle className="text-2xl" />
                    Continue with Google
                </button>
            </div>

            <div className="relative flex h-screen w-full items-center justify-center border-[#7B1984] p-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute h-[350px] w-[350px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[520px] w-[520px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[600px] w-[600px] rounded-full border-2 border-[#7B1984] opacity-30"></div>
                </div>
            </div>
        </div>
    );
}

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
        <div className="flex w-full h-full flex-col md:flex-row bg-[#FFF9F9]">
            {/* Left Side - Login Content */}
            <div className="flex min-h-screen items-center justify-center p-6">
                <div className="relative flex items-center justify-center w-full">
                    {/* Background Circles (Only visible on mobile) */}
                    <div className="absolute flex md:hidden items-center justify-center">
                        <div className="absolute h-[200px] w-[200px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                        <div className="absolute h-[300px] w-[300px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                        <div className="absolute h-[400px] w-[400px] rounded-full border-2 border-[#7B1984] opacity-30"></div>
                    </div>
                </div>

                <div className="w-full h-full p-6 flex flex-col md:justify-baseline justify-center items-center md:items-baseline">
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
            </div>


            {/* Right Side - Visuals */}
            <div className="hidden md:flex w-1/2 items-center justify-center relative p-6">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute h-[200px] w-[200px] md:h-[350px] md:w-[350px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[300px] w-[300px] md:h-[520px] md:w-[520px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[400px] w-[400px] md:h-[600px] md:w-[600px] rounded-full border-2 border-[#7B1984] opacity-30"></div>
                </div>
            </div>
        </div>
    );
}

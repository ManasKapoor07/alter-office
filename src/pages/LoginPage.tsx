import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import taskSrc from "../assets/task.svg";
import listView from '../assets/listview.svg'

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
        <div className="flex flex-col md:flex-row md:bg-none">
            {/* Left Side - Login Content */}
            <div className="flex h-screen w-full flex-col items-center justify-center p-6 ">
                {/* <div className="relative flex items-end justify-end ">
                    <div className="absolute flex md:hidden items-center justify-center ">
                        <div className="absolute h-[50px] w-[50px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                        <div className="absolute h-[80px] w-[80px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                        <div className="absolute h-[100px] w-[100px] rounded-full border-2 border-[#7B1984] opacity-30"></div>
                    </div>
                </div>
                <div className="relative flex w-full">
                    <div className="absolute flex md:hidden items-center justify-center -bottom-56 -left-14">
                        <div className="absolute h-[100px] w-[100px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                        <div className="absolute h-[150px] w-[150px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                        <div className="absolute h-[200px] w-[200px] rounded-full border-2 border-[#7B1984] opacity-30"></div>
                    </div>
                </div> */}



                <div className="w-full h-full p-6 flex md:items-baseline flex-col md:justify-baseline justify-center items-center text-center md:text-left">
                    <h1 className="text-[26px] font-bold text-[#7B1984] flex items-center gap-2">
                        <img src={taskSrc} className="w-[32px] h-[32px]" /> TaskBuddy
                    </h1>
                    <p className="mt-2 text-gray-600 w-xs md:w-md text-[12px] md:text-[16px]">
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
            {/* <div className="relative flex w-full">
                <div className="absolute flex md:hidden items-center justify-center -left-4 right-2">
                    <div className="absolute h-[50px] w-[50px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[100px] w-[100px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[150px] w-[150px] rounded-full border-2 border-[#7B1984] opacity-30"></div>
                </div>
            </div> */}

            {/* Right Side - Visuals */}
            <div className="hidden md:flex w-full items-center justify-center relative p-6">

                <div className="flex justify-end items-end w-full">
                    <img src={listView} className="h-[600px] w-[600px] z-50" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center right-32">
                    <div className="absolute h-[300px] w-[300px] md:h-[400px] md:w-[400px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[400px] w-[300px] md:h-[520px] md:w-[520px] rounded-full border-2 border-[#7B1984] opacity-50"></div>
                    <div className="absolute h-[500px] w-[400px] md:h-[600px] md:w-[600px] rounded-full border-2 border-[#7B1984] opacity-30"></div>
                </div>
            </div>
        </div>
    );
}

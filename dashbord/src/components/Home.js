import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopBar from "./TopBar";
import Dashboard from "./Dashboard";
const Home = () => {
  const navigate = useNavigate();
  const [cookies, removeCookie] = useCookies([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const verifyCookie = async () => {
      try {
        if (!cookies.token) {
          navigate("/login");
          return;
        }
        const { data } = await axios.post(
          "http://localhost:3002/verify", // Make sure this endpoint exists!
          {},
          { withCredentials: true }
        );
        const { status, user } = data;
        setUsername(user);
        if (status) {
          toast(`Hello ${user}`, {
            position: "top-right",
          });
        } else {
          removeCookie("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        removeCookie("token");
        navigate("/login");
      }
    };
    verifyCookie();
  }, [cookies.token, navigate, removeCookie]); // Only react to token change

  const Logout = () => {
    removeCookie("token");
    navigate("/login"); // Changed from signup to login
  };

  return (
    <>
      <div >
        <TopBar username={username}
      onLogout={Logout}/>
      <Dashboard />
      
      </div>
      <ToastContainer />
    </>
  );
};

export default Home;
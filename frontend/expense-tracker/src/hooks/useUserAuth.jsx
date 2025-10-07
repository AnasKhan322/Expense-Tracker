import { useContext } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { useEffect } from "react";

export const useUserAuth = () => {
    const {user, updateUser, clearUser} = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if(user) return; // If user is already set, no need to check auth

        let isMounted = true; // To avoid setting state on unmounted component

        const fetchUserInfo = async () => {
            try{
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
                if(isMounted && response.data){
                    updateUser(response.data);
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
                clearUser();
                navigate("/login");
            }
        };

        fetchUserInfo();

        return () => {
            isMounted = false; // Cleanup flag on unmount
        };
    }, [user, updateUser, clearUser, navigate]);
};
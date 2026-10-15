import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from "../../api/controller/admin_controller/user_controller";

const ProfileContext = createContext();
   
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getResolvedUserId = () => {
  const directId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  if (directId) return directId;
  return getStoredUser()?.id || null;
};

export const ProfileProvider = ({ children }) => {
  const [userProfileData, setUserProfileData] = useState(getStoredUser);
  const [profileLoading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const userID = getResolvedUserId();
    if (!userID) {
      setLoading(false);
      return;
    }
    try {
      const response = await getProfile(userID);
      if (response?.data) {
        setUserProfileData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener("employee-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("employee-profile-updated", handleProfileUpdate);
  }, []);

  return (
    <ProfileContext.Provider value={{ userProfileData, profileLoading, setUserProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

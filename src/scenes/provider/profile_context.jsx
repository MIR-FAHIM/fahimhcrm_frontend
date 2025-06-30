import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from "../../api/controller/admin_controller/user_controller";

const ProfileContext = createContext();
   
export const ProfileProvider = ({ children }) => {

     const userID = localStorage.getItem("userId");
  const [userProfileData, setUserProfileData] = useState(null);
  const [profileLoading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await getProfile(userID);
      setUserProfileData(response.data); // or response.data.data if wrapped
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ userProfileData, profileLoading, setUserProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

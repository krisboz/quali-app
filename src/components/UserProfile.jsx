import { useState } from "react";
import ChangePassword from "./ChangePassword";
import "../styles/components/UserProfile.scss"; // (Optional) Add styles here

const UserProfile = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>
      
      <button onClick={() => setShowChangePassword(!showChangePassword)}>
        {showChangePassword ? "Cancel" : "Change Password"}
      </button>

      {showChangePassword && <ChangePassword />}
    </div>
  );
};

export default UserProfile;

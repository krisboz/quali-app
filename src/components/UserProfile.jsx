import { useState, useContext, useEffect } from "react";
import ChangePassword from "./ChangePassword";
import "../styles/components/UserProfile.scss"; // (Optional) Add styles here
import AuthContext, { AuthProvider } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { searchQualityReportsByUsername } from "../api/api";

const UserProfile = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [madeReports, setMadeReports] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchQualityReports = async () => {
      try {
        const username = user.username;
        setLoading(true); // Start loading before the API call

        const result = await searchQualityReportsByUsername(username);
        setMadeReports(result.count);
      } catch (err) {
        console.error("Error fetching quality reports:", err);
      } finally {
        setLoading(false); // Stop loading when done
      }
    };

    fetchQualityReports();

    // Optional: Cleanup function to handle when the component is unmounted
    return () => {
      setLoading(false); // Cleanup loading state if component unmounts before completion
    };
  }, []); // Empty dependency array ensures the effect runs once on mount

  return (
    <div className="user-profile-container">
      <div className="user-profile-inner-container">
        <div className="profile-username-container">
          <FaUserCircle />
          <p>{user.username}</p>
        </div>
        <div className="change-password-container">
          <button onClick={() => setShowChangePassword(!showChangePassword)}>
            {showChangePassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        <div className="profile-report-container">
          <div className="profile-report-header">
            <h3>Quality Control Reports</h3>
          </div>

          <div className="report-details">
            <p className="report-text">Up until now, you've caught:</p>
            <p className="report-count">{madeReports}</p>
            <p className="report-text">defective items.</p>
          </div>

          <div className="report-footer">
            <p className="additional-info">Great job in maintaining quality!</p>
          </div>
        </div>
      </div>

      {showChangePassword && <ChangePassword />}
    </div>
  );
};

export default UserProfile;

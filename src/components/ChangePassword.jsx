import { useState } from "react";
import { changePassword } from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return;
    }

    // Call API function
    try {
      const response = await changePassword(password);
      toast.success(response.message)
      setPassword("");
      setConfirmPassword("");

      // Redirect to dashboard after success
      setTimeout(() => {
        navigate("/app/dashboard");
      }, 2000);
    } catch (err) {
      toast.error(err.message)
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>

      <form className="password-form" onSubmit={handleSubmit}>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="password-submit-container">
        <button type="submit">Update Password</button>

        </div>
      </form>
    </div>
  );
};

export default ChangePassword;

import ReportPreview from "./components/ReportPreview";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import "./styles/Dashboard.scss"

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [showPreviews, setShowPreviews] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            let username = decoded.username;
            const newUser =
                username.split(".")[0].charAt(0).toUpperCase() +
                username.split(".")[0].slice(1);
            setUser(newUser);
        }
    }, []);


    const toggleShowPreviews = () => {
        setShowPreviews(prev=>!prev)
    }

    const calcTimeOfDay = () => {
        const curHr = new Date().getHours();
        if (curHr < 12) return "Morning";
        if (curHr < 18) return "Afternoon";
        return "Evening";
    };

    const calcDate = () => {
        const currentDate = new Date();
        const currentDayOfMonth = currentDate.getDate();
        const currentMonth = currentDate.getMonth(); 
        const currentYear = currentDate.getFullYear();

        const dateString = currentDayOfMonth + ". " + (currentMonth + 1) + ". " + currentYear + ".";
        return dateString
            }

            const calcDayInWeek = () => {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const today = new Date().getDay();
                return days[today];
            }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="greeting-container">
                    {user ? <p className="greeting-content">Good {calcTimeOfDay()}, {user}!</p> : <p>Loading...</p>}
                </div>
                <div className="current-date-container">
                    <p>{calcDayInWeek()}</p>
                   <p>{calcDate()}
                   </p>                 </div>
            </div>

            <div className="report-preview-header">
                <h2>Report Previews</h2>
                <p>Use the button underneath to generate report previews and decide which data you want to include in your report!</p>
                <p>Keep in mind that depending on the data selected it can take up to a couple of minutes to load</p>
                <button onClick={toggleShowPreviews}>{!showPreviews ? "Generate Report Previews": "Hide Report Previews"}</button>
            </div>

            <div className="report-preview-container">
                {showPreviews && <ReportPreview/>}
            </div>
        </div>
    );
};

export default Dashboard;

import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import "./styles/Dashboard.scss";
import ReportPreview from "./ReportPreview/ReportPreview";
import ReportGenerator from "../../components/ReportGenerator/ReportGenerator";
import OrdersComingThisWeek from "./components/OrdersComingThisWeek";
import InspectionsMadeThisWeek from "./components/InspectionsMadeThisWeek";
import GoldTestsPreview from "./components/GoldTestsPreview";
import DiamondScreeningPreview from "./components/DiamondScreeningPreview";
import { Link } from "react-router-dom";
import { FaMagnifyingGlass as InspectionIcon } from "react-icons/fa6";
import { TbReportAnalytics as GenerateReport } from "react-icons/tb";
import { MdPreview as PreviewIcon } from "react-icons/md";




const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showPreviews, setShowPreviews] = useState(false);
  const [generateReport, setGenerateReport] = useState(false);
  const [recentInspections, setRecentInspections] = useState([]);
  const [recentOrders, setRecentOrders] = useState([])

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
    setShowPreviews((prev) => !prev);
  };

  const toggleGenerateReports = () => {
    setGenerateReport(prev=>!prev)
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

    const dateString =
      String(currentDayOfMonth).padStart(2, "0") +
      ". " +
      String(currentMonth + 1).padStart(2, "0") +
      ". " +
      currentYear +
      ".";
    return dateString;
  };
  const calcDayInWeek = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay();
    return days[today];
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="greeting-container">
          {user ? (
            <p className="greeting-content">
              Good {calcTimeOfDay()}, {user}!
            </p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div className="current-date-container">
          <p>{calcDayInWeek()}</p>
          <p>{calcDate()}</p>{" "}
        </div>

     

        
      </div>
      
      <div className="control-bar">
        <p>
          Controls
        </p>
        <button className="dashboard-control" onClick={toggleShowPreviews}>
          <PreviewIcon/> {!showPreviews ? "Show Report Previews" : "Hide Report Previews"}
        </button>
        <button className="dashboard-control" onClick={toggleGenerateReports}>
         <GenerateReport/> {!generateReport ? "Generate Report" : "Hide Report Generation"}
        </button>
      </div>
       <div className="report-preview-container">
        {showPreviews && <ReportPreview />}
        {generateReport && <ReportGenerator/>}
      </div>

        <div className="dashboard-data-container-orders-inspections">
          <div className="short-intro">
            <h2>QualiTrack – Quality Control, Simplified</h2>
            <p>A custom-built, in-house solution designed to optimize and streamline our quality control processes.

</p>
            <p>Track defects, manage gold and diamond tests, generate Prüfprotokolle, and produce monthly quality reports — all from a single, easy-to-use system tailored for our workflow.</p>
            <p>Found a defective item? What are you waiting for?</p>
            <Link className="hero-inspection-button" to="/app/inspection"><InspectionIcon/> Report it!</Link>
          </div>
      <OrdersComingThisWeek/>

      </div>
      <div className="dashboard-data-container-gold-diamonds">
        <DiamondScreeningPreview/>
        <GoldTestsPreview />
                  <InspectionsMadeThisWeek/>

      </div>
    

{/**
 * THEY WERE THE OLD ONES WITH THE REPORT PREVIEWS AND SHIT 
 *     <div className="report-preview-header">
        <h2>Report Previews</h2>
        <p>
          Use the button underneath to generate report previews and decide which
          data you want to include in your report!
        </p>
        <p>
          Keep in mind that depending on the quantity of data it can take up to
          a couple of minutes to load
        </p>
        <button onClick={toggleShowPreviews}>
          {!showPreviews ? "Show Report Previews" : "Hide Report Previews"}
        </button>
        <button onClick={toggleGenerateReports}>
          {!generateReport ? "Generate Report" : "Hide Report Generation"}
        </button>
      </div>

     
 */}
  
    </div>
  );
};

export default Dashboard;

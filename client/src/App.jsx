import { Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage.jsx";
import CheckClient from "./pages/CheckClient.jsx";
import DashBoard from "./pages/DashBoard.jsx";
import EmployeeLogin from "./pages/EmployeeLogin.jsx";
import CustomerAuth from "./pages/CustomerAuth.jsx";
import ApplicantsList from "./pages/ApplicantsList.jsx";
import EmployeeDashhboard from "./pages/EmployeeDashhboard.jsx";
import UserNotFound from "./pages/UserNotFound.jsx";
import SMEClassificationPage from "./pages/SMEClassificationPage.jsx";
import LoanAmountPage from "./pages/LoanAmountPage.jsx";
import KYC_Upload from "./pages/Documents/KYC_Upload.jsx";
import BusinessProofUpload from "./pages/Documents/BusinessProofPage.jsx";
import IncomeProofPage from "./pages/Documents/IncomeProofPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/check-client" element={<CheckClient />} />
      <Route path="/employee-login" element={<EmployeeLogin />} />
      <Route path="/customer-auth" element={<CustomerAuth />} />
      <Route path="/applicants" element={<ApplicantsList />} />
      <Route path="/employee-dashboard" element={<EmployeeDashhboard />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/UserNotFound" element={<UserNotFound />} />
      <Route path="/sme-classification" element={<SMEClassificationPage />} />
      <Route path="/loan-amount" element={<LoanAmountPage />} />
      <Route path="/kyc-upload" element={<KYC_Upload />} />
      <Route path="/business-proof-upload" element={<BusinessProofUpload />} />
      <Route path="/income-proof-upload" element={<IncomeProofPage />} />
    </Routes>
  );
}

export default App;

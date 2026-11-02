
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import CampaignDetails from "./pages/CampaignDetails";
import OurWork from "./pages/OurWork";
import About from "./pages/About";
import MonthlyGiving from "./pages/MonthlyGiving";
import DonationSuccess from "./pages/DonationSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AccessDenied from "./pages/AccessDenied";
import Volunteer from "./pages/Volunteer";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DonationToast from "./components/DonationToast";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

// Pages where Navbar & Footer should NOT appear
const ADMIN_PATHS = ["/admin", "/admin/login", "/admin/dashboard"];

function Layout() {
    const location = useLocation();
    const isAdminPage = ADMIN_PATHS.some((p) => location.pathname.startsWith(p));

    return (
        <>
            {!isAdminPage && <Navbar />}
            {!isAdminPage && <DonationToast />}

            <main>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaigns/:id" element={<CampaignDetails />} />
                    <Route path="/our-work" element={<OurWork />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/monthly-giving" element={<MonthlyGiving />} />
                    <Route path="/volunteer" element={<Volunteer />} />
                    <Route path="/donate" element={<Navigate to="/campaigns" replace />} />
                    <Route path="/donation-success" element={<DonationSuccess />} />

                    {/* Admin — no navbar/footer */}
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Access Denied */}
                    <Route path="/access-denied" element={<AccessDenied />} />

                    {/* Catch-all → Access Denied */}
                    <Route path="*" element={<AccessDenied />} />
                </Routes>
            </main>

            {!isAdminPage && <Footer />}
        </>
    );
}

function App() {
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("sewaam_custom_campaigns") || "[]");
            const clean = stored.filter((c) => !String(c._id || "").startsWith("custom_"));
            if (clean.length !== stored.length) {
                localStorage.setItem("sewaam_custom_campaigns", JSON.stringify(clean));
            }
        } catch (_) {}
    }, []);

    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}

export default App;

import React from "react";
import { AuthProvider } from "../contexts/AuthContexts";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Login from "./Authentication/Login";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./Authentication/ForgotPassword";
import UpdateProfile from "./Authentication/UpdateProfile";
import LandingPage from "./Authentication/LandingPage";
import TextEditor from "./Text_Editor/TextEditor";
import BookPreview from "./Text_Editor/BookPreview";
import Signup from "./Authentication/Signup";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/update-profile" element={<PrivateRoute><UpdateProfile /></PrivateRoute>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/textEditor" element={<PrivateRoute><TextEditor /></PrivateRoute>} />
          <Route path="/dashboard/textEditor/:fileId" element={<TextEditor />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/book/:id" element={<PrivateRoute><BookPreview /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
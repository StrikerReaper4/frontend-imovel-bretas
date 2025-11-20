import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import PropertySelected from "./pages/PropertySelected";
//import GoogleTranslate from "./components/GoogleTranslate";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <GoogleTranslate />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/property/:id" element={<PropertySelected />} />
        <Route path="/admin" element={<LoginPage />} />
        <Route path="/admin/logged" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

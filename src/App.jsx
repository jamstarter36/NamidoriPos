import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { NamidoriPos } from "./components/NamidoriPos";
import { MemberPage } from "./components/MemberPage";

export default function App() {
  const [page, setPage]     = useState(sessionStorage.getItem("page") || "landing");
  const [member, setMember] = useState(JSON.parse(sessionStorage.getItem("member")) || null);

  // Keep Render backend alive
  useEffect(() => {
    const keepAlive = () => {
      fetch(`${import.meta.env.VITE_API_URL}/health`)
        .then(() => console.log("Server kept alive"))
        .catch(() => console.log("Server ping failed"));
    };
    keepAlive();
    const interval = setInterval(keepAlive, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (data) => {
    if (data.role === "admin") {
      sessionStorage.setItem("page", "pos");
      sessionStorage.removeItem("member");
      setPage("pos");
    } else {
      sessionStorage.setItem("page", "member");
      sessionStorage.setItem("member", JSON.stringify(data.member));
      setMember(data.member);
      setPage("member");
    }
  };

  const handleSignupSuccess = (data) => {
    sessionStorage.setItem("page", "member");
    sessionStorage.setItem("member", JSON.stringify(data.member));
    setMember(data.member);
    setPage("member");
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setMember(null);
    setPage("landing");
  };

  if (page === "landing") return (
    <LandingPage
      onLoginSuccess={handleLoginSuccess}
      onSignupSuccess={handleSignupSuccess}
    />
  );

  if (page === "member") return (
    <MemberPage member={member} onLogout={handleLogout} />
  );

  return <NamidoriPos onLogout={handleLogout} />;
}
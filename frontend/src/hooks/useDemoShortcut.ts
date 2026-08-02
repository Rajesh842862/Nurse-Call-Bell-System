import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useDemoShortcut = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDemoMode = location.pathname === "/demo-mode";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();

        if (isDemoMode) {
          navigate("/");
        } else {
          navigate("/demo-mode", { replace: true });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, isDemoMode]);

  return { isDemoMode };
};

export default useDemoShortcut;

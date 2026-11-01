import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { GlobalSpotlight } from "./GlobalSpotlight";
import { AiChat } from "../ai/AiChat";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell() {
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      } else if (window.innerWidth >= 768) {
        setSidebarOpen(true);
        setSidebarCollapsed(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl h-screen"
            >
              <Sidebar
                isMobile={true}
                collapsed={false}
                onNavigate={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Fixed Sidebar — pinned 100% height */}
      {!isMobile && (
        <aside
          className={`fixed inset-y-0 left-0 z-30 h-screen transition-all duration-300 ${
            sidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            isMobile={false}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          />
        </aside>
      )}

      {/* Main Content Area (padded on desktop to accommodate fixed sidebar) */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          !isMobile ? (sidebarCollapsed ? "pl-20" : "pl-64") : ""
        }`}
      >
        <TopBar toggle={handleToggleSidebar} />

        <GlobalSpotlight />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-100/60 dark:bg-slate-900/40">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Asistente IA Flotante */}
        <AiChat />
      </div>
    </div>
  );
}

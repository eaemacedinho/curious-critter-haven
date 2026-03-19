import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import KreatorNav from "@/components/kreatorz/KreatorNav";
import LandingScreen from "@/components/kreatorz/LandingScreen";
import CreatorScreen from "@/components/kreatorz/CreatorScreen";
import CreatorScreen2 from "@/components/kreatorz/CreatorScreen2";
import DashboardScreen from "@/components/kreatorz/DashboardScreen";
import EditorScreen from "@/components/kreatorz/EditorScreen";
import LoginScreen from "@/components/kreatorz/LoginScreen";
import SettingsScreen from "@/components/kreatorz/SettingsScreen";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("landing");

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <KreatorNav activeTab={activeTab} onTabChange={handleNavigate} />
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          {activeTab === "landing" && <LandingScreen onNavigate={handleNavigate} />}
          {activeTab === "creator" && <CreatorScreen />}
          {activeTab === "creator2" && <CreatorScreen2 />}
          {activeTab === "dash" && <DashboardScreen onNavigate={handleNavigate} />}
          {activeTab === "editor" && <EditorScreen onNavigate={handleNavigate} />}
          {activeTab === "login" && <LoginScreen onNavigate={handleNavigate} />}
          {activeTab === "settings" && <SettingsScreen onNavigate={handleNavigate} />}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default Index;

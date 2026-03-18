import { useState, useCallback } from "react";
import KreatorNav from "@/components/kreatorz/KreatorNav";
import LandingScreen from "@/components/kreatorz/LandingScreen";
import CreatorScreen from "@/components/kreatorz/CreatorScreen";
import DashboardScreen from "@/components/kreatorz/DashboardScreen";
import EditorScreen from "@/components/kreatorz/EditorScreen";

const Index = () => {
  const [activeTab, setActiveTab] = useState("landing");

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <KreatorNav activeTab={activeTab} onTabChange={handleNavigate} />
      {activeTab === "landing" && <LandingScreen onNavigate={handleNavigate} />}
      {activeTab === "creator" && <CreatorScreen />}
      {activeTab === "dash" && <DashboardScreen onNavigate={handleNavigate} />}
      {activeTab === "editor" && <EditorScreen onNavigate={handleNavigate} />}
    </>
  );
};

export default Index;

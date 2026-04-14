import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CreditsContextType = {
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
};

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    const saved = await AsyncStorage.getItem("credits");
    if (saved) setCredits(Number(saved));
  };

  return (
    <CreditsContext.Provider value={{ credits, setCredits }}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);

  if (!context) {
    throw new Error("useCredits must be used inside CreditsProvider");
  }

  return context;
};
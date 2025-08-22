import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import i18n from "../../../i18n";

type LanguageContextType = {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "ru");

  const changeLanguage = useCallback((lang: string) => {
    if (i18n && typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
    }
  }, []);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };

    if (i18n && typeof i18n.on === "function") {
      i18n.on("languageChanged", handleLanguageChanged);

      return () => {
        if (i18n && typeof i18n.off === "function") {
          i18n.off("languageChanged", handleLanguageChanged);
        }
      };
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

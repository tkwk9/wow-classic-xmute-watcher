import React, { useContext } from "react";
import { useMediaQuery } from "react-responsive";

const BreakpointsContext = React.createContext();

const BreakpointsContextProvider = ({ children }) => {
  const isAbove1684 = useMediaQuery({
    query: "(min-width: 1684px)"
  });

  const isAbove1449 = useMediaQuery({
    query: "(min-width: 1449px)"
  });

  const isAbove1279 = useMediaQuery({
    query: "(min-width: 1279px)"
  });

  const isAbove1079 = useMediaQuery({
    query: "(min-width: 1079px)"
  });

  const isAbove849 = useMediaQuery({
    query: "(min-width: 849px)"
  });

  const isMobile = !isAbove849;
  const isDesktopSmall = isAbove849 && !isAbove1079; 
  const isDesktopMedium = isAbove1079 && !isAbove1279;
  const isDesktopLarge = isAbove1279 && !isAbove1449;
  const isDesktopXLarge = isAbove1449 && !isAbove1684;
  const isDesktopMax = isAbove1684
  

  return (
    <BreakpointsContext.Provider
      value={{
        isMobile,
        isDesktopSmall,
        isDesktopMedium,
        isDesktopLarge,
        isDesktopXLarge,
        isDesktopMax,
      }}
    >
      {children}
    </BreakpointsContext.Provider>
  );
};

export const useBreakpoints = () => useContext(BreakpointsContext);

export default BreakpointsContextProvider;

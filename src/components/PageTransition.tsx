import React, { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Un tout petit délai pour déclencher l'animation dès que la page apparaît
    const timer = setTimeout(() => setIsMounted(true), 90);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out transform ${
        isMounted 
          ? 'opacity-100 translate-y-0'      
          : 'opacity-0 translate-y-4'       
      }`}
    >
      {children}
    </div>
  );
};
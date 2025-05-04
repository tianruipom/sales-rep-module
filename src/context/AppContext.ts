import React from 'react';

type AppContextType = {
  chatClient: any;
  loginUser: (config: any) => void;
  logout: () => void;
  switchUser: (userId?: string) => void;
  unreadCount: number | undefined;
};

export const AppContext = React.createContext({} as AppContextType);

export const useAppContext = () => React.useContext(AppContext);
 
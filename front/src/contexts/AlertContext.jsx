import React, { createContext, useContext, useState, useCallback } from 'react';
import Alert from '../components/Alert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, type = 'info', duration = 3000) => {
    setAlert({ message, type });
    if (duration) {
      setTimeout(() => {
        setAlert(null);
      }, duration);
    }
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <Alert message={alert.message} type={alert.type} />
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  return useContext(AlertContext);
};

"use client";
import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";

interface CartContextType {
  pendingFiles: { [key: string]: File };
  addFileToQueue: (cartId: string, file: File) => void;
  removeFileFromQueue: (cartId: string) => void;
  clearPendingFiles: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [pendingFiles, setPendingFiles] = useState<{ [key: string]: File }>({});

  const addFileToQueue = useCallback((cartId: string, file: File) => {
    setPendingFiles((prev) => ({ ...prev, [cartId]: file }));
  }, []);

  const removeFileFromQueue = useCallback((cartId: string) => {
    setPendingFiles((prev) => {
      const newState = { ...prev };
      delete newState[cartId];
      return newState;
    });
  }, []);

  const clearPendingFiles = useCallback(() => setPendingFiles({}), []);

  const contextValue = useMemo(() => ({
    pendingFiles,
    addFileToQueue,
    removeFileFromQueue,
    clearPendingFiles
  }), [pendingFiles, addFileToQueue, removeFileFromQueue, clearPendingFiles]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
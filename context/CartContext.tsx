"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface CartContextType {
  pendingFiles: { [key: string]: File };
  addFileToQueue: (cartId: string, file: File) => void;
  removeFileFromQueue: (cartId: string) => void;
  clearPendingFiles: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [pendingFiles, setPendingFiles] = useState<{ [key: string]: File }>({});

  const addFileToQueue = (cartId: string, file: File) => {
    setPendingFiles((prev) => ({ ...prev, [cartId]: file }));
  };

  const removeFileFromQueue = (cartId: string) => {
    setPendingFiles((prev) => {
      const newState = { ...prev };
      delete newState[cartId];
      return newState;
    });
  };

  const clearPendingFiles = () => setPendingFiles({});

  return (
    <CartContext.Provider value={{ pendingFiles, addFileToQueue, removeFileFromQueue, clearPendingFiles }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
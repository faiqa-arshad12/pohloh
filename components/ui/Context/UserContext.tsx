// context/UserContext.tsx
'use client';

import { Role } from '@/types/types';
import { createContext, useContext, useState, ReactNode } from 'react';

type UserContextType = {
  roleAccess: Role | null;
  setRoleAccess: (role: Role | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [roleAccess, setRoleAccess] = useState<Role | null>(null);

  return (
    <UserContext.Provider value={{ roleAccess, setRoleAccess }}>
      {children}
    </UserContext.Provider>
  );
}

export function useRole() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useRole must be used within a UserProvider');
  }
  return context;
}
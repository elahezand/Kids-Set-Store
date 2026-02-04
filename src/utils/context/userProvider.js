"use client";
import { createContext } from "react";

export const UserContext = createContext(null);

export default function UserProvider({ children, user }) {
    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
}
"use client";

import { useState } from "react";
import Login from "@/components/template/main/login-register/Login";
import Register from "@/components/template/main/login-register/Register";
import AuthShell from "@/components/modules/main/authShell";
import type { AuthMode } from "@/types";

const AuthForms = () => {
  const [mode, setMode] = useState<Exclude<AuthMode, "sms">>("login");

  return (
    <AuthShell image="/images/76ba6563b561fc2d6f5ec0c89377dcde.jpg">
      {mode === "login" ? (
        <Login showRegisterForm={() => setMode("register")} />
      ) : (
        <Register showLoginForm={() => setMode("login")} />
      )}
    </AuthShell>
  );
};

export default AuthForms;

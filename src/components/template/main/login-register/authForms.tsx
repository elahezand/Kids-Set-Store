"use client";

import { useState } from "react";
import AuthShell from "@/components/modules/main/authShell";
import LoginForm from "@/components/template/main/login-register/loginForm";
import RegisterForm from "@/components/template/main/login-register/registerForm";
import type { AuthMode } from "@/types";

const AuthForms = () => {
  const [mode, setMode] = useState<Exclude<AuthMode, "sms">>("login");

  return (
    <AuthShell image="/images/76ba6563b561fc2d6f5ec0c89377dcde.jpg">
      {mode === "login" ? (
        <LoginForm showRegisterForm={() => setMode("register")} />
      ) : (
        <RegisterForm showLoginForm={() => setMode("login")} />
      )}
    </AuthShell>
  );
};

export default AuthForms;

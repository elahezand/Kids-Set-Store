"use client"
import { authTypes } from "@/utils/constants";
import { useState } from "react";
import Login from "@/components/template/main/login-register/Login";
import Register from "@/components/template/main/login-register/Register";
import AuthShell from "@/components/modules/main/authShell";

const Login_register = () => {
    const [authType, setAuthType] = useState(authTypes.LOGIN);

    const showRegisterForm = () => setAuthType(authTypes.REGISTER);
    const showloginForm = () => setAuthType(authTypes.LOGIN);

    return (
        <AuthShell image="/images/76ba6563b561fc2d6f5ec0c89377dcde.jpg">
            {authType === authTypes.LOGIN ? (
                <Login showRegisterForm={showRegisterForm} />
            ) : (
                <Register showloginForm={showloginForm} />
            )}
        </AuthShell>
    );
};

export default Login_register;

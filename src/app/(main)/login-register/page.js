"use client"
import { authTypes } from "@/utils/constants";
import { useState } from "react";
import Login from "@/components/template/login-register/Login";
import Register from "@/components/template/login-register/Register";
import Image from "next/image";
const Login_register = () => {
    const [authType, setAuthType] = useState(authTypes.LOGIN);

    const showRegisterForm = () => setAuthType(authTypes.REGISTER);
    const showloginForm = () => setAuthType(authTypes.LOGIN);

    return (
        <>
            <div className="login_register">
                <div className="form_bg" data-aos="fade-up">
                    {authType === authTypes.LOGIN ? (
                        <Login showRegisterForm={showRegisterForm}
                        />
                    ) : (
                        <Register showloginForm={showloginForm}
                        />
                    )}
                </div>
                <section>
                    <Image
                        width={400}
                        height={400}
                        src="/images/76ba6563b561fc2d6f5ec0c89377dcde.jpg"
                        alt=""
                    />
                </section>
            </div>
        </>
    );
};

export default Login_register;

import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

const hashPassword = async (password) => {
    const hashedPasswored = await hash(password, 12)
    return hashedPasswored
}

const verifyPassword = async (password, hashedPasswored) => {
    const verifiedPassword = await compare(password, hashedPasswored)
    return verifiedPassword
}

const generateToken = async (data) => {
    const token = await sign({ ...data }, process.env.privateKey, {
        algorithm: "HS256",
        expiresIn: "60s"
    })

    return token
}


const verifyToken = async (token) => {
    try {
        return await verify(token, process.env.privateKey)
    } catch (err) {
        return null
    }
}

const generateRefreshToken = async (data) => {
    const token = await sign({ ...data }, process.env.REFRESH_TOKEN, {
        algorithm: "HS256",
        expiresIn: "15d"
    })

    return token
}

const verifyRefreshToken = async (refreshToken) => {
    const verifiredfreshtoken = await verify(refreshToken, process.env.REFRESH_TOKEN,)
    return verifiredfreshtoken
}


export {
    hashPassword,
    generateToken,
    verifyPassword,
    verifyToken,
    generateRefreshToken,
    verifyRefreshToken
}
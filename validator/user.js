const validateEmail = (email) => {
    const regex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/g;
    return regex.test(email)
}


const validatePhone = (phone) => {
    const regex = /(^[0-9]{11}$)/
    return regex.test(phone)
}


const validateUserNane = (username) => {
    const regex = /^[a-z0-9_-]{3,15}$/
    return regex.test(username)
}
const validatePassword = (password) => {
    const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
    return regex.test(password)
}

export { validateEmail, validatePhone, validateUserNane,validatePassword }
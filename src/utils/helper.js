import swal from "sweetalert";
const showSwal = (title, icon, button) => {
    return swal({
        title: title,
        icon: icon,
        buttons: button
    })
}

export const pageinatedData = (array, page, pageSize) => {

    const lastChild = page * pageSize
    const firstChild = lastChild - pageSize

    const pageCount = Math.ceil(array.length / pageSize)

    const filteredArray = array.slice(firstChild, lastChild)

    return [filteredArray, pageCount]
}


export const manageError = (status) => {

    if (status !== 200) {
        let message = null
        if (status === 400) message = "Please Fill OUT required Field";
        else if (status === 401) message = "Unauthorized Request";
        else if (status === 409) message = "This account already existed";
        else if (status === 404) message = "Not Found";
        else if (status === 410) message = " Code Expired";
        else if (status === 422) message = "your Info Not valid";
        else if (status === 500) message = "server Error";
        else message = `unexpected Error (${res.status})`

        swal({
            title: "Error",
            text: message,
            icon: "warning",
            buttons: "ok"
        })
        return
    }
}





export default showSwal
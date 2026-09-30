import Contact from "@/model/contact";

const createContact = async (data) => {
    return Contact.create(data);
};

export {
    createContact,
};

export default {
    createContact,
};

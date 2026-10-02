import Contact from "@/model/contact";

const createContact = async (data) => {
    return Contact.create(data);
};

const contacrService = {
    createContact,
};

export default contacrService

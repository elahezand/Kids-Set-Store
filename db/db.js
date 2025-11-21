const mongoose = require('mongoose');

const connectToDB = async () => {
    try {
        if (mongoose.connections[0].readyState) {
            return false
        }
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Connected To DB Successfully!')

    } catch (err) {
        console.log("error in conection")
    }
}

export default connectToDB

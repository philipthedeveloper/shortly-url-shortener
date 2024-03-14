import { connect } from "mongoose";

const connectDB = async (cb) => {
  try {
    const connection = await connect(process.env.MONGODB_CONNECTION_STRING);
    console.log(`Connected to the db...`);
    if (cb) {
      cb();
    }
  } catch (error) {
    console.log(`Error while connection to db...`, error);
  }
};

export default connectDB;

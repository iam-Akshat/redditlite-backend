import dotenv from "dotenv";
import path from "path";

const res = dotenv.config({path:path.join(__dirname, '../.env')});

export default res.parsed!;

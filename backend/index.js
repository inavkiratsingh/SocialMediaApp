import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import userRoute from "./routes/user.route.js";
dotenv.config({});

const PORT = process.env.PORT || 3000;

const app = express();

app.get('/', (req,res) => {
    return res.status(200).json({
        message: "I m comming form backend",
        success: true
    })
})

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended: true}));
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}
app.use(cors(corsOptions))


app.use("/api/v1/user", userRoute);


app.listen(PORT,() => {
    connectDb();
    console.log(`Server listen at port ${PORT}`);
})
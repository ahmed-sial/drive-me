import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type {Request, Response} from "express";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Hello World!" });
})

export default app;

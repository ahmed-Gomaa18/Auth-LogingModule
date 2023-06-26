import Iuser from "Interfaces/userInterface";

declare namespace Express {

    export interface Request {
        user: Iuser
    }
}

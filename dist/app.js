"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv")); // Move this line to the top
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./util/database"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT; // Default to 3000 if PORT is not set
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(user_routes_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.authenticate();
        // const password = "Kuldeep200#";
        // const hasw = bcrypt.hashSync(password,10);
        // console.log("hasw :", hasw);
        // const compare = bcrypt.compare(password,hasw).then((result) => {
        //     console.log("result :",result);
        // });
        yield database_1.default.sync({ force: true })
            .then(() => {
            console.log("Database synced successfully.");
        })
            .catch((syncError) => {
            console.error("Error syncing database:", syncError);
        });
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
// Start the server
startServer();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseComponent = void 0;
const routes_1 = __importDefault(require("./routes"));
const courseComponent = (app) => {
    app.use('/course', routes_1.default.CourseRouter);
};
exports.courseComponent = courseComponent;

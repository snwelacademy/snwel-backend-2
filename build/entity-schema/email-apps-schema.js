"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMTPSchema = void 0;
const zod_1 = require("zod");
exports.SMTPSchema = zod_1.z.object({
    sender: zod_1.z.string().optional(),
    host: zod_1.z.string(),
    port: zod_1.z.string(),
    auth: zod_1.z.object({
        username: zod_1.z.string(),
        password: zod_1.z.string()
    })
});

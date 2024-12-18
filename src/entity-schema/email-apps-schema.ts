import { z } from "zod";

export const SMTPSchema = z.object({
    sender: z.string().optional(),
    host: z.string(),
    port: z.string(),
    // secure: z.boolean(),
    auth: z.object({
        username: z.string(),
        password: z.string()
    })
})




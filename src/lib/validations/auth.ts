import { z } from "zod";

export const signInSchema = z.object({
    email: z
        .string().email("Enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    keepMeLoggedIn: z.boolean().optional(),
});

export const signUpSchema = z.object({
    fname: z
        .string()
        .min(1, { message: "First name is required" })
        .regex(/^[a-zA-Z\s'-]+$/, { message: "First name must be valid" }),
    lname: z
        .string()
        .min(1, { message: "Last name is required" })
        .regex(/^[a-zA-Z\s'-]+$/, { message: "Last name must be valid" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
        .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
        .regex(/\d/, { message: "Password must contain a number" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Must include a special character" }),
    confirm_password: z.string(),
    phone: z.string().min(10, "Phone number is required"),
    gender: z.enum(["male", "female", "other"]),
    date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    address: z.string(),
    zip: z.string(),
    referred_by: z.string().optional(),
    terms: z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions", }),
    }),
}).refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
});



export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/services/session.server";
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    // TODO: Implement actual authentication logic
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // For now, return a mock user
    return {
      id: "1",
      email: email.toString(),
      name: "John Doe",
    };
  }),
  "user-pass"
);
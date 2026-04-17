import jwt from "jsonwebtoken";

export function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

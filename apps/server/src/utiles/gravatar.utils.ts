import crypto from "crypto";

export default function gravatar(email: string, size: number = 256) {
  const hash = crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}`;
}

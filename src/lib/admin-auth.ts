import { createHmac, timingSafeEqual } from "node:crypto";

type AdminTokenPayload = {
  sub: string;
  exp: number;
};

const secret = () => process.env.ADMIN_JWT_SECRET ?? "gts-admin-dev-secret";

const sign = (payloadBase64: string) =>
  createHmac("sha256", secret()).update(payloadBase64).digest("hex");

export const createAdminToken = (username: string, expiresInSeconds = 60 * 60) => {
  const payload: AdminTokenPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
};

export const verifyAdminToken = (token?: string) => {
  if (!token) {
    return null;
  }
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }
  const expected = sign(payloadBase64);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  const decoded = JSON.parse(Buffer.from(payloadBase64, "base64url").toString()) as AdminTokenPayload;
  if (decoded.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return decoded;
};


import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function normalizeCpfDigits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 11);
}

function getPortalSecret() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "portal-local-secret"
  );
}

export function hashPortalPassword(password: string, cpf: string) {
  return createHash("sha256")
    .update(`${getPortalSecret()}:${normalizeCpfDigits(cpf)}:${password.trim()}`)
    .digest("hex");
}

export function verifyPortalPasswordHash(
  storedHash: string | undefined,
  password: string,
  cpf: string,
) {
  if (!storedHash || !password.trim()) {
    return false;
  }

  const expected = hashPortalPassword(password, cpf);

  try {
    return timingSafeEqual(Buffer.from(storedHash), Buffer.from(expected));
  } catch {
    return false;
  }
}

export type PortalSessionPayload = {
  patientId: string;
  cpf: string;
  iat: number;
  exp: number;
};

export function createPortalSessionToken({
  patientId,
  cpf,
  expiresInHours = 24 * 7,
}: {
  patientId: string;
  cpf: string;
  expiresInHours?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload: PortalSessionPayload = {
    patientId,
    cpf: normalizeCpfDigits(cpf),
    iat: now,
    exp: now + expiresInHours * 60 * 60,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getPortalSecret())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

export function verifyPortalSessionToken(token: string) {
  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getPortalSecret())
    .update(encoded)
    .digest("base64url");

  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as PortalSessionPayload;

    if (!payload?.patientId || !payload?.cpf || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

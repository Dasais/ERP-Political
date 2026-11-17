export const Session = {
  cookieName: "erp_sid",
  maxAgeMs: 30 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
} as const;

/** Должность по умолчанию для члена партии без особой роли */
export const DEFAULT_MEMBER_ROLE = "Член партии";

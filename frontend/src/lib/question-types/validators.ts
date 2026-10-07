import type { ErrorCode } from "./types"

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  required: "This field is required.",
  invalid_email: "Please enter a valid email address.",
  too_short: "This answer is too short.",
  too_long: "This answer is too long.",
  too_small: "The value is too small.",
  too_large: "The value is too large.",
  invalid_type: "Invalid format.",
}

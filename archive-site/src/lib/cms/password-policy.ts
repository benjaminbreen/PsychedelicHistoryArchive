export function passwordProblem(password: string, confirmation: string): "length" | "match" | null {
  if (password.length < 12 || password.length > 128) return "length";
  if (password !== confirmation) return "match";
  return null;
}

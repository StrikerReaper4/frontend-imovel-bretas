import { local } from "./storage";

// Sessão válida = token presente e ainda dentro do prazo gravado no login.
export function isLoggedIn() {
  const token = local.get("token");
  const expiry = Number(local.get("token_expiry"));
  return Boolean(token && expiry && Date.now() < expiry);
}

export function isAdmin() {
  if (!isLoggedIn()) return false;
  const user = local.getJSON("user");
  // Usuários antigos podem não ter `role` salvo — nesse caso trata como admin,
  // já que hoje só o admin tem login.
  return !user?.role || user.role === "admin";
}

export function logout() {
  local.remove("token");
  local.remove("token_expiry");
  local.remove("user");
}

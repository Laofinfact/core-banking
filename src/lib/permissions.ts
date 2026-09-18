export const ALL_FUNCTIONS = "ALL_FUNCTIONS";
export const ALL_FUNCTIONS_READ = "ALL_FUNCTIONS_READ";

/**
 * Checks whether the given permission codes grant access to a specific
 * permission code.
 *
 * Fineract returns only the exact permission codes assigned to the user's
 * roles. Roles holding the wildcard permissions `ALL_FUNCTIONS` (everything)
 * or `ALL_FUNCTIONS_READ` (all read access) do NOT expand into the full list,
 * so those wildcards must be honored explicitly.
 */
export function hasPermission(permissions: string[], code: string): boolean {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes(ALL_FUNCTIONS)) return true;
  if (permissions.includes(ALL_FUNCTIONS_READ) && code.startsWith("READ_")) return true;
  return permissions.includes(code);
}

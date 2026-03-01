const styleMap = {
  HIGH: "badge-high",
  MEDIUM: "badge-medium",
  LOW: "badge-low",
  TODO: "badge-todo",
  IN_PROGRESS: "badge-in-progress",
  DONE: "badge-done",
  PERSONAL: "badge-role",
  TEAM_MEMBER: "badge-role",
  TEAM_ADMIN: "badge-role-admin",
  SYSTEM_ADMIN: "badge-role-system",
};

const labelMap = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  PERSONAL: "Personal",
  TEAM_MEMBER: "Member",
  TEAM_ADMIN: "Admin",
  SYSTEM_ADMIN: "System Admin",
};

export function GlassBadge({ type, label, className = "" }) {
  const displayLabel = label ?? labelMap[type] ?? type;
  return (
    <span className={`badge ${styleMap[type] || "badge-role"} ${className}`}>
      {displayLabel}
    </span>
  );
}

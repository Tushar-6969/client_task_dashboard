"use client"

export default function TaskCard({ task, onComplete, onDelete }) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "completed"

  // Set background color based on priority
  const priorityColor = () => {
    if (task.priority === "high") return "#ffcccc" // light red
    if (task.priority === "medium") return "#fff4cc" // light yellow
    if (task.priority === "low") return "#ccffcc" // light green
    return "#f0f0f0" // default
  }

  return (
    <div
      style={{
        border: isOverdue ? "2px solid red" : "1px solid #ccc",
        padding: "15px",
        marginBottom: "15px",
        borderRadius: "8px",
        backgroundColor: priorityColor(),
        color: "#333", // dark text for visibility
      }}
    >
      <h3 style={{ margin: "0 0 5px 0" }}>
        {task.title}{" "}
        {isOverdue && (
          <span style={{ color: "red", fontWeight: "bold" }}>
            (OVERDUE)
          </span>
        )}
      </h3>

      <p style={{ margin: "5px 0" }}>{task.description}</p>
      <p style={{ margin: "5px 0" }}>
        <strong>Status:</strong> {task.status}
      </p>

      {task.due_date && (
        <p style={{ margin: "5px 0" }}>
          <strong>Due:</strong>{" "}
          {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}

      <p style={{ margin: "5px 0" }}>
        <strong>Priority:</strong>{" "}
        <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>
          {task.priority}
        </span>
      </p>

      <div style={{ marginTop: "10px" }}>
        {task.status !== "completed" && onComplete && (
          <button
            onClick={() => onComplete(task.id)}
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              padding: "6px 12px",
              cursor: "pointer",
              marginRight: "10px",
              borderRadius: "4px",
            }}
          >
            Mark Completed
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              padding: "6px 12px",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

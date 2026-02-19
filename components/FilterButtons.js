"use client"

export default function FilterButtons({ currentFilter, setFilter }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setFilter("pending")}
        style={{
          marginRight: "10px",
          background:
            currentFilter === "pending" ? "#0070f3" : "#ddd",
          color:
            currentFilter === "pending" ? "white" : "black",
        }}
      >
        Pending
      </button>

      <button
        onClick={() => setFilter("in_progress")}
        style={{
          marginRight: "10px",
          background:
            currentFilter === "in_progress"
              ? "#0070f3"
              : "#ddd",
          color:
            currentFilter === "in_progress"
              ? "white"
              : "black",
        }}
      >
        In Progress
      </button>

      <button
        onClick={() => setFilter("completed")}
        style={{
          background:
            currentFilter === "completed"
              ? "#0070f3"
              : "#ddd",
          color:
            currentFilter === "completed"
              ? "white"
              : "black",
        }}
      >
        Completed
      </button>
    </div>
  )
}

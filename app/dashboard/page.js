"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

import FilterButtons from "@/components/FilterButtons"
import TaskCard from "@/components/TaskCard"

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState("pending")
  const [role, setRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [staffList, setStaffList] = useState([])

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    assigned_to: "",
    status: "pending",
  })

  const router = useRouter()

  // ----------------- Protect Route & Load Data -----------------
  useEffect(() => {
    const checkUser = async () => {
      console.log("Checking session...")
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Session error:", sessionError)
        return
      }

      if (!session) {
        router.push("/login")
        return
      }

      setUserId(session.user.id)

      // Fetch role
      let { data: roleData, error: roleError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle()

      if (roleError) {
        console.error("Error fetching role:", roleError)
        return
      }

      if (!roleData) {
        // Create profile if missing
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: session.user.id, role: "staff" })
        if (insertError) {
          console.error("Error creating profile:", insertError)
          return
        }
        roleData = { role: "staff" }
      }

      setRole(roleData.role)
      await fetchTasks(roleData.role, session.user.id)

      // Load staff list if admin
      if (roleData.role === "admin") {
        const { data: staffData, error: staffError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("role", "staff")
        if (staffError) console.error("Error fetching staff list:", staffError)
        else setStaffList(staffData)
      }
    }

    checkUser()
  }, [])

  // ----------------- Fetch Tasks -----------------
  const fetchTasks = async (roleParam, uid) => {
    let query = supabase.from("tasks").select("*").order("created_at", { ascending: false })
    if (roleParam === "staff") query = query.eq("assigned_to", uid)

    const { data, error } = await query
    if (error) console.error("Error fetching tasks:", error)
    else setTasks(data)
  }

  // ----------------- Logout -----------------
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // ----------------- Update Task Status -----------------
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", id)
    if (error) console.error("Error updating status:", error)
    else fetchTasks(role, userId)
  }

  // ----------------- Delete Task (Admin Only) -----------------
  const deleteTask = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (error) console.error("Error deleting task:", error)
    else fetchTasks(role, userId)
  }

  // ----------------- Create Task (Admin Only) -----------------
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assigned_to) return alert("Fill title and assign to staff!")
    const { error } = await supabase.from("tasks").insert([
      {
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date || null,
        priority: newTask.priority,
        assigned_to: newTask.assigned_to,
        status: "pending",
      },
    ])
    if (error) console.error("Error creating task:", error)
    else {
      setNewTask({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
        assigned_to: "",
        status: "pending",
      })
      fetchTasks(role, userId)
    }
  }

  // ----------------- Filter Tasks -----------------
  const filteredTasks = tasks.filter((task) => task.status === filter)

  // ----------------- Helper: overdue check -----------------
  const isOverdue = (task) => {
    if (!task.due_date) return false
    const now = new Date()
    const due = new Date(task.due_date)
    return now > due && task.status !== "completed"
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h2>Client Task Dashboard</h2>

      <p>
        Logged in as: <strong>{role}</strong>
      </p>
      <button onClick={handleLogout}>Logout</button>
      <hr />

      {/* ================= Admin Create Task ================= */}
      {role === "admin" && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Create Task</h3>

          <input
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <br />
          <br />

          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <br />
          <br />

          <input
            type="date"
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          />
          <br />
          <br />

          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <br />
          <br />

          <select
            value={newTask.assigned_to}
            onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
          >
            <option value="">-- Assign to Staff --</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.id}
              </option>
            ))}
          </select>
          <br />
          <br />

          <button onClick={handleCreateTask}>Add Task</button>
          <hr />
        </div>
      )}

      {/* ================= Filters ================= */}
      <FilterButtons currentFilter={filter} setFilter={setFilter} />

      {/* ================= Task List ================= */}
      {filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            overdue={isOverdue(task)}
            onComplete={(id) => updateStatus(id, "completed")}
            onDelete={role === "admin" ? deleteTask : null}
          />
        ))
      )}
    </div>
  )
}

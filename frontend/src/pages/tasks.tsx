import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../services/api";
import { Task } from "../types/task";
import { MessageSquare, CheckSquare } from "lucide-react";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/signin");
    else fetchTasks(token);
  }, []);

  const fetchTasks = async (token: string) => {
    try {
      const data = await api.getTasks(token);
      setTasks(data);
    } catch (err) {
      console.error(err);
      router.push("/signin");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const newTask = await api.createTask(token, title);
      setTasks([...tasks, newTask]);
      setTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (task: Task) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const updated = await api.updateTask(token, task.id, { is_completed: !task.is_completed });
      setTasks(tasks.map(t => t.id === task.id ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await api.deleteTask(token, id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Todo List</h1>
        <div className="flex gap-2">
          <Link href="/chat" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            <MessageSquare size={18} />
            Chat with AI
          </Link>
        </div>
      </div>
      <form onSubmit={handleAddTask} className="flex gap-2 mb-8">
        <input type="text" placeholder="New task..." value={title} onChange={e => setTitle(e.target.value)} className="flex-1 border p-2 rounded" required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
      </form>
      <ul className="space-y-4">
        {tasks.length === 0 ? (
          <li className="text-center py-12 text-gray-400">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tasks yet</p>
            <p className="text-sm">Add a task or chat with AI to get started</p>
          </li>
        ) : (
          tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between p-4 bg-white shadow rounded-lg">
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={task.is_completed} onChange={() => toggleTask(task)} className="w-5 h-5" />
                <span className={task.is_completed ? "line-through text-gray-400" : ""}>{task.title}</span>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:underline">Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

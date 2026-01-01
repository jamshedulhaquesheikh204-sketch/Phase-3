import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "../services/api";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.signup(email, password);
      localStorage.setItem("token", data.token);
      router.push("/tasks");
    } catch (err: any) {
      setError(err.detail || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full border p-2 mb-4" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full border p-2 mb-4" required />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}

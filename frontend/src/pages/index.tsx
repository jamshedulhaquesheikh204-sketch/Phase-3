import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">Welcome to Todo App</h1>
      <div className="space-x-4">
        <Link href="/signup" className="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</Link>
        <Link href="/signin" className="bg-green-500 text-white px-4 py-2 rounded">Sign In</Link>
      </div>
    </div>
  );
}

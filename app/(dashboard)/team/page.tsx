import Link from "next/link";

export default function TeamPage() {
  return (
    <div className="bg-white p-6 rounded-lg shadow col-span-2">
      <h1 className="text-2xl font-bold mb-4">Team Overview</h1>
      <ul className="space-y-2">
        <li><Link href="/team/jane" className="text-blue-600 hover:underline">Jane Doe</Link></li>
        <li><Link href="/team/bob" className="text-blue-600 hover:underline">Bob Smith</Link></li>
      </ul>
    </div>
  );
}
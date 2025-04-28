"use client";

import { useParams } from "next/navigation";

export default function MemberPage() {
  const { member } = useParams();

  return (
    <div className="bg-white p-6 rounded-lg shadow col-span-2">
      <h1 className="text-2xl font-bold">Team Member: {member}</h1>
      <p>This is the profile page for {member}.</p>
    </div>
  );
}
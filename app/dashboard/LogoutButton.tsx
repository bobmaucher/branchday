"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
    });

    if (res.ok) {
      router.push("/");
    } else {
      console.error("Logout failed");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-white text-purple-700 px-4 py-2 rounded-md font-semibold shadow hover:bg-gray-100 transition"
    >
      Log Out
    </button>
  );
}
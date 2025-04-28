export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-xl font-semibold text-gray-800">Team Section</div>
        {children}
      </div>
    );
  }  
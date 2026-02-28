import FdoEditor from "@/components/fdo-editor";

export default function Editor() {
  return (
    <div className="flex h-screen w-full">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <FdoEditor/>
      </div>
    </div>
  );
}

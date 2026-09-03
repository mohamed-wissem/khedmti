import Component from "@/components/ui/optimized-black-hole";

export default function Default() {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
      <Component />
    </div>
  );
}

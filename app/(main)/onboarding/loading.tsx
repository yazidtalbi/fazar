import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Loader variant="premium" />
    </div>
  );
}

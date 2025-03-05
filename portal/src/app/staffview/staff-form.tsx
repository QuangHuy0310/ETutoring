import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/componets/ui/staffbutton";

const StaffForm = () => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <div className="w-12 h-12 bg-gray-300 rounded-full" /> {/* Avatar */}
      <div className="flex-grow">
        <p className="text-lg font-semibold">Staff Name - Role</p>
      </div>
      <Button onClick={() => router.push("/matching")}>
        Matching Page
      </Button>
    </div>
  );
};

export default StaffForm;
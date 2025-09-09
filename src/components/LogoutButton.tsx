"use client";

import { logout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          setLoading(true);
          await logout();
          router.replace("/login");
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
    >
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}

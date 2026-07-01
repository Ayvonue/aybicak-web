"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    return (
        <Button
            onClick={async () => { setLoading(true); await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); router.refresh(); }}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-white/10 text-zinc-300 hover:text-white"
        >
            <LogOut className="w-4 h-4 mr-2" /> Çıkış
        </Button>
    );
}

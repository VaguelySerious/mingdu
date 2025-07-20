"use client";

import { hasAIKey } from "@/ai/provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "@/lib/store";
import { Settings, SettingsIcon, Trash2, User } from "lucide-react";
import { useState } from "react";

export function ProfileMenu() {
  const profile = useChatStore((state) => state.profile);
  const setProfile = useChatStore((state) => state.setProfile);
  const [isOpen, setIsOpen] = useState(false);

  const handleChangeName = () => {
    const newName = prompt("Enter your name:", profile.name);
    if (newName !== null && newName.trim() !== "") {
      setProfile({ ...profile, name: newName.trim() });
    }
  };

  const handleDeleteApiKeys = () => {
    if (
      confirm(
        "Are you sure you want to delete your API keys? This action cannot be undone."
      )
    ) {
      // Clear API keys from localStorage
      localStorage.removeItem("openai-api-key");
      localStorage.removeItem("anthropic-api-key");
      alert("API keys have been deleted.");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleChangeName}>
          <User className="mr-2 h-4 w-4" />
          Change Name
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* TODO: Make these into toggle buttons */}
        <DropdownMenuItem
          disabled
          onClick={() => alert("Coming soon!")}
          className=""
        >
          <SettingsIcon className="mr-2 h-4 w-4" />
          Toggle English corrections
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled
          onClick={() => alert("Coming soon!")}
          className=""
        >
          <SettingsIcon className="mr-2 h-4 w-4" />
          Toggle word spacing
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!hasAIKey("openai") && !hasAIKey("anthropic")}
          onClick={handleDeleteApiKeys}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete stored API Keys
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

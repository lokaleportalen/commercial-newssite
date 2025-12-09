"use client";

import { useState } from "react";
import { Search, Loader2, User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserSelect: (user: User) => void;
}

export function UserSearchModal({
  open,
  onOpenChange,
  onUserSelect,
}: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Søgefelt tomt", {
        description: "Indtast et navn eller en email for at søge",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      const data = await response.json();
      setUsers(data.users);

      if (data.users.length === 0) {
        toast.info("Ingen brugere fundet", {
          description: "Prøv en anden søgning",
        });
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Fejl", {
        description: "Kunne ikke søge efter brugere",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleUserClick = (user: User) => {
    onUserSelect(user);
    onOpenChange(false);
    // Reset search state
    setSearchQuery("");
    setUsers([]);
    setHasSearched(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Find bruger</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Søg på navn eller email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {hasSearched && users.length === 0 && !isSearching && (
            <div className="text-center text-muted-foreground py-8">
              Ingen brugere fundet
            </div>
          )}

          {!hasSearched && !isSearching && (
            <div className="text-center text-muted-foreground py-8">
              Søg efter brugere med navn eller email
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

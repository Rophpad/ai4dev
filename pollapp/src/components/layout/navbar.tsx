"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Plus, BarChart3 } from "lucide-react";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    username: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span className="text-xl font-bold">PollApp</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          <Link
            href="/polls"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/polls")
                ? "text-foreground"
                : "text-foreground/60"
            }`}
          >
            All Polls
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard")
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
              >
                Dashboard
              </Link>
              <Link href="/polls/create">
                <Button size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Poll</span>
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* User Menu / Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  className?: string;
}

export default function AuthButtons({ className }: AuthButtonsProps) {
  return (
    <div className={`flex gap-3 ${className || ''}`}>
      <Button variant="outline">
        Login
      </Button>
      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        Sign Up
      </Button>
    </div>
  );
}
import { cn } from "@/app/lib/utils"
import { Button } from "@/app/componets/ui/button"
import { Input } from "@/app/componets/ui/input"
import { Label } from "@/app/componets/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form className={cn("flex flex-col gap-4", className)} {...props}>
      {/* Logo Section */}
      <div className="flex justify-center">
        <img src="/logo-transparent.png" alt="Logo" className="h-12 w-12" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-bold">Account</h1>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Account</Label>
          <Input id="email" type="email" placeholder="Enter your account" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
          <a href="#" className="text-sm text-right underline-offset-4 hover:underline">
            Forgotten Password?
          </a>
        </div>

        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>

      <div className="text-center text-sm">
        New user?{" "}
        <a href="#" className="font-medium underline underline-offset-4">
          Register.
        </a>
      </div>
    </form>
  )
}

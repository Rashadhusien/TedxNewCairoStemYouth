"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setShowPassword((prev) => !prev)
    }

    return (
      <InputGroup className={cn("w-full", className)}>
        <InputGroupInput
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="xs"
            onClick={togglePasswordVisibility}
            className="hover:bg-transparent"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-3.5 text-muted-foreground transition-colors hover:text-foreground" />
            ) : (
              <Eye className="size-3.5 text-muted-foreground transition-colors hover:text-foreground" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }

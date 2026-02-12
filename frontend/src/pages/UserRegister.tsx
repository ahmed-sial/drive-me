import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import React, { useState } from "react"
const UserRegister = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const submitLoginForm = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <form onSubmit={submitLoginForm}>
      <div className="h-screen flex flex-col justify-between overflow-hidden">

        <div className="flex flex-col">
          <img src="/black-logo.svg" alt="Drive me logo" className="w-1/4 m-4" />
          <div className="w-full max-w-md mx-auto px-4 m-4">
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field className="w-full">
                <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                <Input
                  value={firstName}
                  onChange={(e: React.ChangeEvent) => setFirstName((e.target as HTMLInputElement).value)}
                  id="first-name"
                  placeholder="John"
                  className="w-full 
                  placeholder:text-xs bg-[#eeeeee]" />
              </Field>

              <Field className="w-full">
                <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                <Input
                  value={lastName}
                  onChange={(e: React.ChangeEvent) => setLastName((e.target as HTMLInputElement).value)}
                  id="last-name"
                  placeholder="Doe"
                  className="w-full placeholder:text-xs bg-[#eeeeee]" />
              </Field>
            </FieldGroup>
          </div>
          <div className="mx-4">
            <Field>
              <FieldLabel htmlFor="input-field-email">What's your email?</FieldLabel>
              <Input
                value={email}
                onChange={(e: React.ChangeEvent) => setEmail((e.target as HTMLInputElement).value)}
                id="input-field-email"
                type="email"
                placeholder="example@example.com"
                className="placeholder:text-xs bg-[#eeeeee]"
              />
            </Field>
          </div>
          <div className="m-4">
            <Field>
              <FieldLabel htmlFor="input-field-password">What's your password?</FieldLabel>
              <Input
                value={confirmPassword}
                onChange={(e: React.ChangeEvent) => setConfirmPassword((e.target as HTMLInputElement).value)}
                id="input-field-password"
                type="password"
                placeholder="••••••••"
                className="placeholder:text-xs bg-[#eeeeee]"
              />
            </Field>
          </div>
          <div className="mx-4">
            <Field>
              <FieldLabel htmlFor="input-field-password">Confirm your password</FieldLabel>
              <Input
                value={password}
                onChange={(e: React.ChangeEvent) => setPassword((e.target as HTMLInputElement).value)}
                id="input-field-password"
                type="password"
                placeholder="••••••••"
                className="placeholder:text-xs bg-[#eeeeee]"
              />
            </Field>
          </div>
          <Button className="p-6 m-4">Create Account</Button>
          <p className="text-center">Already a user? <Link to="/user-login" className="text-blue-500 underline">Login now</Link></p>
        </div>
        <Button className="p-6 m-4" variant={"outline"}><Link to={"/captain-login"}>Sign in as Captain</Link></Button>
      </div>
    </form>
  )
}

export default UserRegister
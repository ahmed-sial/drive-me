import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import React, { useState } from "react"
const CaptainLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const submitLoginForm = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(email + " " + password)
    setEmail("")
    setPassword("")
  }

  return (
    <form onSubmit={submitLoginForm}>
      <div className="h-screen flex flex-col justify-between">
        <div className="flex flex-col">
          <img src="/black-logo.svg" alt="Drive me logo" className="w-1/4 m-4" />
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
                value={password}
                onChange={(e: React.ChangeEvent) => setPassword((e.target as HTMLInputElement).value)}
                id="input-field-password"
                type="password"
                placeholder="••••••••"
                className="placeholder:text-xs bg-[#eeeeee]"
              />
            </Field>
          </div>
          <Button className="p-6 m-4">Login as Captain</Button>
          <p className="text-center">New captain? <Link to="/captain-register" className="text-blue-500 underline">Register now</Link></p>
        </div>
        <Button className="p-6 m-4" variant={"outline"}><Link to={"/user-login"}>Sign in as User</Link></Button>
      </div>
    </form>
  )
}

export default CaptainLogin 
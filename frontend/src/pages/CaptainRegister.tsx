import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import React, { useState } from "react"

const CaptainRegister = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [vehicleColor, setVehicleColor] = useState("")
  const [plateNumber, setPlateNumber] = useState("")
  const [capacity, setCapacity] = useState("")
  const [vehicleType, setVehicleType] = useState("")

  const submitRegisterForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setVehicleColor("")
    setPlateNumber("")
    setCapacity("")
    setVehicleType("")
  }

  return (
    <form onSubmit={submitRegisterForm}>
      <div className="h-screen flex flex-col justify-between overflow-x-hidden">
        <div className="flex flex-col">
          <img src="/black-logo.svg" alt="Drive me logo" className="w-1/4 m-4" />

          {/* Name Fields */}
          <div className="w-full max-w-md mx-auto px-4 m-4">
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field className="w-full">
                <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} id="first-name" placeholder="John" className="w-full placeholder:text-xs bg-[#eeeeee]" />
              </Field>
              <Field className="w-full">
                <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} id="last-name" placeholder="Doe" className="w-full placeholder:text-xs bg-[#eeeeee]" />
              </Field>
            </FieldGroup>
          </div>

          {/* Email */}
          <div className="mx-4">
            <Field>
              <FieldLabel htmlFor="email">What's your email?</FieldLabel>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="example@example.com" className="placeholder:text-xs bg-[#eeeeee]" />
            </Field>
          </div>

          {/* Password */}
          <div className="m-4">
            <Field>
              <FieldLabel htmlFor="password">What's your password?</FieldLabel>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="••••••••" className="placeholder:text-xs bg-[#eeeeee]" />
            </Field>
          </div>

          <div className="mx-4">
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm your password</FieldLabel>
              <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} id="confirm-password" type="password" placeholder="••••••••" className="placeholder:text-xs bg-[#eeeeee]" />
            </Field>
          </div>

          {/* Vehicle Info */}
          <div className="w-full max-w-md mx-auto px-4 mt-6">
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="vehicle-color">Vehicle Color</FieldLabel>
                <Input value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} id="vehicle-color" placeholder="Black" className="placeholder:text-xs bg-[#eeeeee]" />
              </Field>

              <Field>
                <FieldLabel htmlFor="vehicle-type">Vehicle Type</FieldLabel>
                <Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} id="vehicle-type" placeholder="Car / Bike" className="placeholder:text-xs bg-[#eeeeee]" />
              </Field>

              <Field>
                <FieldLabel htmlFor="plate-number">Plate Number</FieldLabel>
                <Input value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} id="plate-number" placeholder="ABC-1234" className="placeholder:text-xs bg-[#eeeeee]" />
              </Field>

              <Field>
                <FieldLabel htmlFor="capacity">Passenger Capacity</FieldLabel>
                <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} id="capacity" placeholder="4" type="number" className="placeholder:text-xs bg-[#eeeeee]" />
              </Field>
            </FieldGroup>
          </div>

          <Button className="p-6 m-4">Create Captain Account</Button>
          <p className="text-center">Already a captain? <Link to="/captain-login" className="text-blue-500 underline">Login now</Link></p>
        </div>

        <Button className="p-6 m-4" variant={"outline"}>
          <Link to="/user-login">Sign in as User</Link>
        </Button>
      </div>
    </form>
  )
}

export default CaptainRegister
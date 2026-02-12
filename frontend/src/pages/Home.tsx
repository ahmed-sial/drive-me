import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <>
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="relative text-center">
          <img src="/white-logo.svg" alt="Drive me logo" className="absolute top-2 left-4 w-1/4" />
          <img src="/home_image.jpg" alt="Car image" />
        </div>
        <h1 className="text-2xl font-bold m-2">Get started with DriveMe</h1>
        <Button className="p-6 m-2"><Link to='/user-login'>Continue</Link><ArrowRightIcon /></Button>

      </div>
    </>
  )
}

export default Home
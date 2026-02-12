import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import UserLogin from "./pages/UserLogin"
import CaptainLogin from "./pages/CaptainLogin"
import UserRegister from "./pages/UserRegister"
import CaptainRegister from "./pages/CaptainRegister"

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/captain-login" element={<CaptainLogin />} />
        <Route path="/user-register" element={<UserRegister />} />
        <Route path="/captain-register" element={<CaptainRegister />} />
      </Routes>
    </>
  )
}

export default App

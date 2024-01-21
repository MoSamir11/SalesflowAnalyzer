import { useState, createContext } from "react";
import Home from './components/home';
import Dashboard from './components/dashboard';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./components/context/SocketProvider";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
      <Routes>
          <Route path="dashboard/:id/:chatroom" element={<Dashboard />} />
          <Route path="/" element={<Home />} />
          <Route index element={<Home />} />
          <Route path="*" element={<Home />} />
      </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;

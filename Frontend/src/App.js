import { useState, createContext } from "react";
import Home from './components/home';
import HomeWithID from './components/homewithID';
import Salesmen from './components/Salesmen';
import SalesmenWithID from './components/SalesmenwithID';
import Dashboard from './components/dashboard';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./components/context/SocketProvider";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
      <Routes>
          <Route path="dashboard/:chatroom" element={<Dashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/:id" element={<HomeWithID />} />
          <Route path="/salesmen" element={<Salesmen />} />
          <Route path="/salesmen/:id" element={<SalesmenWithID />} />
          <Route index element={<Home />} />
          <Route path="*" element={<Home />} />
      </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;

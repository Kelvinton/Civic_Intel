
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Health from "./pages/Health.jsx";
import Education from "./pages/Education.jsx";
import States from "./pages/States.jsx";
import StateDetails from "./pages/StatesDetail.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<Health />} />
          <Route path="/education" element={<Education />} />
          <Route path="/states" element={<States />} />
          <Route path="/states/:stateSlug" element={<StateDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

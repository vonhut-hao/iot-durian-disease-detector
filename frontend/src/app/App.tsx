import { BrowserRouter, Routes, Route } from "react-router";
import ScannerPage from "./pages/ScannerPage";
import TreeMonitorPage from "./pages/TreeMonitorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScannerPage />} />
        <Route path="/tree/:treeId" element={<TreeMonitorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

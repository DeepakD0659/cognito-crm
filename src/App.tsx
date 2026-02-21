import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/themes";
import RoleBasedLayout from "./components/layout/RoleBasedLayout";
import SupabaseSync from "./components/SupabaseSync";
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import KDS from "./pages/KDS";
import Inventory from "./pages/Inventory";
import Rostering from "./pages/Rostering";
import Customer from "./pages/Customer";
import POS from "./pages/POS";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SupabaseSync />
          <RoleBasedLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/operations" element={<Operations />} />
              <Route path="/kds" element={<KDS />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/rostering" element={<Rostering />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/qr-order" element={<Customer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RoleBasedLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

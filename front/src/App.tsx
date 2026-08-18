import Layout from "./components/Layout";
import { useAccessLog } from "./hooks/useAccessLog";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  useAccessLog();

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

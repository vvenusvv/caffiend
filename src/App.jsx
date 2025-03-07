import CoffeeForm from "./components/CoffeeForm";
import Hero from "./components/Hero";
import History from "./components/History";
import Layout from "./components/Layout";
import Stats from "./components/Stats";
import { useAuthContext } from "./context/AuthContext";

function App() {
  const { globalUser, isLoading, globalData } = useAuthContext();
  const isAuthenticated = globalUser;
  const isData = globalData && !!Object.keys(globalData || {}).length;

  const authenticatedContent = (
    <>
      <Stats />
      <History />
    </>
  );

  return (
    <Layout>
      <Hero />
      <CoffeeForm isAuthenticated={isAuthenticated} />
      {isAuthenticated && isLoading && <p>Loading data...</p>}
      {isAuthenticated && isData && authenticatedContent}
    </Layout>
  );
}

export default App;

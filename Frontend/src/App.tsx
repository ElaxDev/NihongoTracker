import Header from './components/Header';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <ToastContainer autoClose={2000} position="bottom-right" />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;

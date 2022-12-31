import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/common/Footer';
import Navigation from './components/common/Navigation';

function App() {
  return (
    <Router>
      <Navigation/>
      <main>
        <Routes>
          <Route path="/" element={<Home/>}/>
        </Routes>
        <Footer/>
      </main>
    </Router>
  );
}

export default App;

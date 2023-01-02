import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/common/Footer';
import Navigation from './components/common/Navigation';
import Login from './pages/Login';
import Logout from './pages/Logout';
import PrivateRoute from './components/auth/PrivateRoute';
import Dashboard from './pages/Dashboard';
import ProvideAuth from './components/auth/ProvideAuth';
import RecipeMutate from './pages/recipes/RecipeMutate';
import AlertNotifications from './components/notifications/AlertNotifcations';
import Notifications from './components/notifications/Notifications';

function App() {
  return (
    <Router>
      <ProvideAuth>
        <Navigation/>
        <main>
          <AlertNotifications>
            <Notifications/>
            <Routes>
              <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>}/>
              <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
              <Route path="/recipes/:recipeId" element={<PrivateRoute><RecipeMutate/></PrivateRoute>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/logout" element={<Logout/>}/>
            </Routes>
            <Footer/>
          </AlertNotifications>
        </main>
      </ProvideAuth>
    </Router>
  );
}

export default App;

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
import RecipeList from './pages/recipes/RecipeList';
import ShoppingLists from './pages/lists/ShoppingLists';
import ShoppingListMutate from './pages/lists/ShoppingListMutate';
import ShoppingListView from './pages/lists/ShoppingListView';
import TokenList from './pages/tokens/TokenLists';
import TokenMutate from './pages/tokens/TokenMutate';
import SettingsMutate from './pages/settings/SettingMutate';
import AuditList from './pages/audits/AuditList';
import ShareList from './pages/shares/ShareList';
import ShareMutate from './pages/shares/ShareMutate';
import { Privacy } from './pages/Privacy';

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
              <Route path="/privacy" element={<Privacy/>}/>
              <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
              <Route path="/recipes" element={<PrivateRoute><RecipeList/></PrivateRoute>}/>
              <Route path="/recipes/:recipeId" element={<PrivateRoute><RecipeMutate/></PrivateRoute>}/>
              <Route path="/lists" element={<PrivateRoute><ShoppingLists/></PrivateRoute>}/>
              <Route path="/lists/:listId" element={<PrivateRoute><ShoppingListMutate/></PrivateRoute>}/>
              <Route path="/lists/:listId/view" element={<PrivateRoute><ShoppingListView/></PrivateRoute>}/>
              <Route path="/tokens" element={<PrivateRoute><TokenList/></PrivateRoute>}/>
              <Route path="/tokens/:tokenId" element={<PrivateRoute><TokenMutate/></PrivateRoute>}/>
              <Route path="/settings" element={<PrivateRoute><SettingsMutate/></PrivateRoute>}/>
              <Route path="/audits" element={<PrivateRoute><AuditList/></PrivateRoute>}/>
              <Route path="/shares" element={<PrivateRoute><ShareList/></PrivateRoute>}/>
              <Route path="/shares/:shareId" element={<PrivateRoute><ShareMutate/></PrivateRoute>}/>
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

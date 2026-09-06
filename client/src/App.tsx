import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/NotFound';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ChangePassword } from './pages/ChangePassword';
import Guide from './pages/Guide';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import { LanguageProvider } from './contexts/LanguageContext';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/guide" component={() => <ProtectedRoute component={Guide} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path="/change-password" component={() => <ProtectedRoute component={ChangePassword} />} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, ChevronDown, Leaf } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth(); // Changed logout to signOut which should match the AuthContextType
  const { translate } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = async () => {
    try {
      await signOut(); // Changed from logout to signOut
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  return (
    <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <NavLink to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-500" />
          <span className="font-bold">Gram</span>
          <span className="text-primary-dark">Sahay</span>
        </NavLink>
      </div>
      
      <div className="hidden md:flex space-x-1">
        <NavLink 
          to="/" 
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            isActive('/') 
              ? 'bg-primary text-white' 
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          {translate('home')}
        </NavLink>

        <NavLink 
          to="/government" 
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            isActive('/government') 
              ? 'bg-primary text-white' 
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          {translate('government')}
        </NavLink>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
              >
                {translate('services')}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <NavLink to="/dashboard" className="w-full cursor-pointer">
                  {translate('dashboard')}
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/report" className="w-full cursor-pointer">
                  Report Issue
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/issues" className="w-full cursor-pointer">
                  Issue Feed
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/community-map" className="w-full cursor-pointer">
                  Community Map
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/analytics" className="w-full cursor-pointer">
                  Analytics
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/leaderboard" className="w-full cursor-pointer">
                  Leaderboard
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/assistant" className="w-full cursor-pointer">
                  AI Assistant
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="hidden md:flex items-center space-x-2">
        {user ? (
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-8 w-8 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <NavLink to="/dashboard" className="cursor-pointer">
                    Dashboard
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  {translate('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <NavLink to="/sign-in">
              <Button variant="outline" size="sm">{translate('signin')}</Button>
            </NavLink>
            <NavLink to="/sign-up">
              <Button size="sm">{translate('signup')}</Button>
            </NavLink>
          </>
        )}
      </div>
      
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-50 p-4">
          <div className="flex flex-col space-y-2">
            <NavLink 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              onClick={toggleMenu}
            >
              {translate('home')}
            </NavLink>
            

            <NavLink 
              to="/government" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/government') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
              onClick={toggleMenu}
            >
              {translate('government')}
            </NavLink>
            
            {user && (
              <>
                <div className="pt-2 pb-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Services</p>
                </div>
                
                <NavLink 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleMenu}
                >
                  {translate('dashboard')}
                </NavLink>
                
                <NavLink 
                  to="/report" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/report') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleMenu}
                >
                  Report Issue
                </NavLink>
                
                <NavLink 
                  to="/issues" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/issues') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleMenu}
                >
                  Issue Feed
                </NavLink>
                
                <NavLink 
                  to="/community-map" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/community-map') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleMenu}
                >
                  Community Map
                </NavLink>
                
                <NavLink 
                  to="/analytics" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/analytics') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleMenu}
                >
                  Analytics
                </NavLink>
                
                <NavLink 
                  to="/leaderboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/leaderboard') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleMenu}
                >
                  Leaderboard
                </NavLink>
                
                <NavLink 
                  to="/assistant" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/assistant') 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleMenu}
                >
                  AI Assistant
                </NavLink>
              </>
            )}
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  {translate('logout')}
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <NavLink to="/sign-in" onClick={toggleMenu} className="w-full">
                    <Button variant="outline" className="w-full">{translate('signin')}</Button>
                  </NavLink>
                  <NavLink to="/sign-up" onClick={toggleMenu} className="w-full">
                    <Button className="w-full">{translate('signup')}</Button>
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

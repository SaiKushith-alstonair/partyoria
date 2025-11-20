import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, CheckCircle, XCircle } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState("customer");
  
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'vendor') {
      setUserType('vendor');
    }
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const addUser = (user: any) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
      
      if (username.length < 3) {
        alert('Username must be at least 3 characters');
        return;
      }
      
      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
        alert('Password does not meet requirements');
        return;
      }
      
      if (password !== confirmPassword) {
        alert("Passwords don't match");
        return;
      }
      
      // Use appropriate endpoint based on user type
      const endpoint = userType === 'vendor' 
        ? 'http://localhost:8000/api/vendor/auth/register/'
        : 'http://localhost:8000/api/auth/register/';
      
      const requestBody = userType === 'vendor' 
        ? {
            email: email,
            full_name: username,
            password: password
          }
        : {
            username: username,
            email: email,
            password: password,
            password_confirm: confirmPassword,
            first_name: username,
            last_name: '',
            user_type: userType
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || Object.values(data).flat().join(', ') || 'Registration failed');
        return;
      }
      
      // Store tokens in Zustand for vendor
      if (userType === 'vendor' && data.access) {
        const authStorage = {
          state: {
            user: data.vendor,
            tokens: {
              access: data.access,
              refresh: data.refresh
            },
            isAuthenticated: true
          },
          version: 0
        };
        localStorage.setItem('auth-storage', JSON.stringify(authStorage));
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        alert('Vendor registration successful! Complete your profile.');
        navigate('/vendor/onboarding', { replace: true });
      } else {
        alert('Registration successful! Please login with your credentials.');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1 relative">
          <Button 
            variant="ghost" 
            className="absolute top-0 right-0 hover:bg-transparent bg-transparent text-black" 
            size="icon" 
            onClick={() => navigate("/")}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
          <CardTitle className="text-2xl font-bold text-center font-heading">Sign Up</CardTitle>
          <CardDescription className="text-center">
            {userType === 'vendor' ? 'Create a vendor account to offer your services' : 'Create an account to get started with Partyoria'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input 
                placeholder="Enter a username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent bg-transparent text-black"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </Button>
              </div>
            </div>
            
            {/* Password strength indicators */}
            {password && !(hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar) && (
              <div className="space-y-2 text-sm">
                <p className="font-medium">Password must contain:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    {hasMinLength ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center">
                    {hasUppercase ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className="flex items-center">
                    {hasLowercase ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div className="flex items-center">
                    {hasNumber ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                    <span>Number</span>
                  </div>
                  <div className="flex items-center">
                    {hasSpecialChar ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent bg-transparent text-black"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </Button>
              </div>
            </div>
            

            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm">
            Already have an account?{" "}
            <a onClick={() => navigate("/login")} className="text-purple-600 hover:underline cursor-pointer">
              Log in
            </a>
          </p>
          <p className="text-center text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
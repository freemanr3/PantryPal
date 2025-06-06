import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';

// Define props type
type AuthPageProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

export default function AuthPage({ params }: AuthPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, signup, confirmAccount, forgotPassword, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  // State for confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [signupUsername, setSignupUsername] = useState("");

  // Add state for forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      });
      
      setLocation("/discover");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to log in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const signupResult = await signup(username, email, password);
      
      // If user needs confirmation
      if (!signupResult.userConfirmed) {
        setSignupUsername(signupResult.username);
        setShowConfirmation(true);
        toast({
          title: "Verification needed",
          description: "Please check your email for a verification code and enter it below.",
        });
      } else {
        toast({
          title: "Welcome to Pantry Pal!",
          description: "Your account has been created successfully.",
        });
        setLocation("/discover");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await confirmAccount(signupUsername, confirmationCode);
      
      // After successful confirmation, automatically sign in the user
      await login(email, password);
      
      toast({
        title: "Account verified!",
        description: "Your account has been verified and you are now signed in.",
      });
      
      // Redirect to discover page
      setLocation("/discover");
    } catch (error) {
      console.error("Confirmation error:", error);
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Failed to verify account. Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If showing confirmation screen
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-orange-600">Verify Your Account</CardTitle>
            <CardDescription>
              Please enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfirmation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmation-code">Verification Code</Label>
                <Input 
                  id="confirmation-code" 
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter verification code" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-orange-600">Pantry Pal</CardTitle>
          <CardDescription>
            Your personal recipe discovery and meal planning assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <button type="button" className="text-xs text-blue-600 hover:underline mt-1" onClick={() => setShowForgotPassword(true)}>Forgot password?</button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="Choose a username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="Create a password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>

      {showForgotPassword && (
        <div className="mt-4 p-4 bg-white rounded shadow border max-w-md mx-auto">
          {forgotStep === 'request' ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              try {
                await forgotPassword(forgotEmail);
                toast({ title: 'Check your email', description: 'A verification code has been sent.' });
                setForgotStep('verify');
              } catch (error) {
                toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send reset code.', variant: 'destructive' });
              } finally {
                setIsLoading(false);
              }
            }} className="space-y-4">
              <Label htmlFor="forgot-email">Email</Label>
              <Input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Reset Code'}</Button>
              <button type="button" className="text-xs text-gray-500 mt-2" onClick={() => setShowForgotPassword(false)}>Back to login</button>
            </form>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              try {
                await resetPassword(forgotEmail, forgotCode, forgotNewPassword);
                toast({ title: 'Password reset!', description: 'You can now log in with your new password.' });
                setShowForgotPassword(false);
                setForgotStep('request');
                setForgotEmail("");
                setForgotCode("");
                setForgotNewPassword("");
              } catch (error) {
                toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to reset password.', variant: 'destructive' });
              } finally {
                setIsLoading(false);
              }
            }} className="space-y-4">
              <Label htmlFor="forgot-code">Verification Code</Label>
              <Input id="forgot-code" value={forgotCode} onChange={e => setForgotCode(e.target.value)} required />
              <Label htmlFor="forgot-new-password">New Password</Label>
              <Input id="forgot-new-password" type="password" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</Button>
              <button type="button" className="text-xs text-gray-500 mt-2" onClick={() => setShowForgotPassword(false)}>Back to login</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
} 
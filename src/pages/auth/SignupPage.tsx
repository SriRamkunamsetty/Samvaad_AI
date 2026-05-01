import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const initUserProfile = async (user: any, displayName: string) => {
     await setDoc(doc(db, "users", user.uid), {
       email: user.email,
       displayName: displayName || user.displayName || "User",
       createdAt: serverTimestamp(),
       role: "user"
     }, { merge: true });
     
     await setDoc(doc(db, "users", user.uid, "profile", "settings"), {
       tonePreference: "professional",
       reducedMotion: false,
       updatedAt: serverTimestamp()
     }, { merge: true });
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await initUserProfile(user, name);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await initUserProfile(user, user.displayName || "");
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to authenticate with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background/50 border-white/10 focus-visible:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background/50 border-white/10 focus-visible:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background/50 border-white/10 focus-visible:ring-primary/50"
          />
        </div>

        <Button type="submit" className="w-full relative group overflow-hidden" disabled={loading || googleLoading}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-white/20 to-primary/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Sign Up
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1 bg-border/50" />
        <span className="text-xs uppercase text-muted-foreground font-medium">Or continue with</span>
        <Separator className="flex-1 bg-border/50" />
      </div>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full bg-background/50 border-white/10 hover:bg-white/5 transition-all"
        onClick={handleGoogleSignup}
        disabled={loading || googleLoading}
      >
        {googleLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
          <svg className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
        )}
        Google
      </Button>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

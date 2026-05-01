import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password">
      {!submitted ? (
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-muted-foreground text-sm mb-4">
            Enter your email address and we will send you a link to reset your password.
          </p>
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

          <Button type="submit" className="w-full relative group overflow-hidden mt-6" disabled={loading}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-white/20 to-primary/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Send Reset Link
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <h3 className="text-xl font-medium">Check your email</h3>
          <p className="text-muted-foreground text-sm">
            We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>.
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Back to signing in
        </Link>
      </div>
    </AuthLayout>
  );
}

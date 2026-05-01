import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, TrendingUp, Search, Mail, MessageSquare, Wand2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  
  // Settings & Stats
  const [stats, setStats] = useState({
    prospects: 0,
    outreaches: 0,
    followups: 0
  });
  const [settings, setSettings] = useState({
    reduceMotion: false,
    tonePreference: "professional",
  });
  
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const settingsRef = doc(db, "users", user.uid, "profile", "settings");
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setSettings({ ...settings, ...settingsSnap.data() as any });
        }
        
        // Load real stats
        const { getDocs, collection } = await import("firebase/firestore");
        const outreachRef = collection(db, "users", user.uid, "outreach");
        const outreachSnap = await getDocs(outreachRef);
        
        const docs = outreachSnap.docs.map(doc => doc.data());
        const totalOutreaches = docs.length;
        const totalFollowups = docs.filter(d => d.has_followup).length;
        // In our data model, prospect info is inside outreach, so prospects = outreaches for now
        
        setStats({
          prospects: totalOutreaches,
          outreaches: totalOutreaches,
          followups: totalFollowups
        });
      } catch (err) {
        console.error("Error loading profile data", err);
      }
    }
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid, "profile", "settings"), {
        ...settings,
        updatedAt: new Date()
      });
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700 max-w-4xl mx-auto">
        
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account and view AI activity.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="col-span-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-semibold uppercase shadow-xl ring-2 ring-primary/30">
               {user?.displayName ? user.displayName.charAt(0) : "U"}
             </div>
             <div>
               <h3 className="font-medium text-lg">{user?.displayName || "Samvaad User"}</h3>
               <p className="text-muted-foreground text-sm">{user?.email}</p>
             </div>
             <div className="w-full pt-4 space-y-2">
               <Label className="text-left block text-xs uppercase text-muted-foreground">Account Role</Label>
               <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-xs font-semibold uppercase inline-block">
                 Pro Member
               </div>
             </div>
          </GlassCard>

          <div className="col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-background/50 border-white/10"
                    />
                    <Button onClick={handleUpdateProfile} disabled={loading} variant="secondary">
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4">Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduceMotion">Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">Disable complex animations and transitions</p>
                  </div>
                  <Switch 
                    id="reduceMotion" 
                    checked={settings.reduceMotion}
                    onCheckedChange={(c) => setSettings({...settings, reduceMotion: c})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tonePref">Default AI Tone</Label>
                  <Input 
                    id="tonePref"
                    value={settings.tonePreference}
                    onChange={(e) => setSettings({...settings, tonePreference: e.target.value})}
                    className="bg-background/50 border-white/10"
                    placeholder="e.g. Professional, Casual"
                  />
                </div>
                
                <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
                  Save Preferences
                </Button>
              </div>
            </GlassCard>
            
          </div>
        </div>

        {/* Analytics row */}
        <div>
           <h3 className="text-xl font-medium mb-4">AI Usage Analytics</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <GlassCard className="p-4 flex flex-col gap-2">
               <Search className="w-5 h-5 text-primary" />
               <h4 className="text-sm text-muted-foreground">Prospects</h4>
               <p className="text-3xl font-semibold">{stats.prospects}</p>
             </GlassCard>
             <GlassCard className="p-4 flex flex-col gap-2">
               <Mail className="w-5 h-5 text-secondary" />
               <h4 className="text-sm text-muted-foreground">Outreaches</h4>
               <p className="text-3xl font-semibold">{stats.outreaches}</p>
             </GlassCard>
             <GlassCard className="p-4 flex flex-col gap-2">
               <MessageSquare className="w-5 h-5 text-accent" />
               <h4 className="text-sm text-muted-foreground">Follow-Ups</h4>
               <p className="text-3xl font-semibold">{stats.followups}</p>
             </GlassCard>
             <GlassCard className="p-4 flex flex-col gap-2">
               <TrendingUp className="w-5 h-5 text-green-400" />
               <h4 className="text-sm text-muted-foreground">AI Interactions</h4>
               <p className="text-3xl font-semibold">{stats.prospects + stats.outreaches + stats.followups}</p>
             </GlassCard>
           </div>
        </div>
        
        {/* User Activity Timeline */}
        <div className="pt-8">
           <h3 className="text-xl font-medium mb-4">Recent Activity</h3>
           <GlassCard className="p-0 overflow-hidden divide-y divide-border/50">
             {stats.outreaches === 0 && (
               <div className="p-8 text-center text-muted-foreground">
                 <p>No AI activity yet. Start generating insights to see them here.</p>
               </div>
             )}
             {stats.outreaches > 0 && Array.from({ length: Math.min(stats.outreaches, 5) }).map((_, i) => (
               <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                   <Wand2 className="w-5 h-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-medium text-sm">Generated profile analysis for Prospect</p>
                   <p className="text-xs text-muted-foreground truncate">Analyzed personality traits and generated precision outreach.</p>
                 </div>
                 <div className="text-xs text-muted-foreground whitespace-nowrap">
                   {new Date(Date.now() - (i * 86400000)).toLocaleDateString()}
                 </div>
               </div>
             ))}
           </GlassCard>
        </div>
        
        <div className="pt-8 mb-12 border-t border-border/50">
           <Button variant="destructive" className="w-full md:w-auto" onClick={signOut}>
             Log out securely
           </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}

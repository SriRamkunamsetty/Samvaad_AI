import { DashboardLayout } from "@/components/DashboardLayout";
import { GlassCard } from "@/components/GlassCard";
import { Sparkles } from "lucide-react";

const SettingsPage = () => (
  <DashboardLayout title="Settings" subtitle="Configure your relationship intelligence workspace.">
    <GlassCard className="p-10 text-center">
      <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-primary/20 border border-primary/20 grid place-items-center mb-4 animate-pulse-glow">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-1">Coming soon</h3>
      <p className="text-sm text-muted-foreground">Workspace preferences, AI memory tuning, and integrations.</p>
    </GlassCard>
  </DashboardLayout>
);

export default SettingsPage;

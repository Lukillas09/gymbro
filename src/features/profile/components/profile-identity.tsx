import type { ProfileIdentityModel } from "../types";
import { ProfileHeader } from "./profile-header";
import { ProfileMetrics } from "./profile-metrics";
import { RecentActivity } from "./recent-activity";
import { TrainingIdentity } from "./training-identity";

export function ProfileIdentity({
  model,
}: Readonly<{ model: ProfileIdentityModel }>) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8 sm:py-10 lg:py-14">
      <ProfileHeader identity={model.identity} />
      <ProfileMetrics metrics={model.metrics} />
      <TrainingIdentity model={model} />
      <RecentActivity activities={model.recentActivity} />
    </div>
  );
}

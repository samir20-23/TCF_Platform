'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate: string;
  isNew: boolean;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

const AchievementBadges = ({ achievements }: AchievementBadgesProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="rounded-lg bg-card p-6 shadow-academic">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Réalisations récentes
          </h2>
          <Icon name="TrophyIcon" size={24} className="text-accent" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.slice(0, 4).map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-md border border-border p-4"
            >
              <div className="mb-2 flex items-center space-x-3">
                <div className="rounded-full bg-accent/10 p-2">
                  <Icon name={achievement.icon as any} size={20} className="text-accent" />
                </div>
                <h3 className="font-caption text-sm font-medium text-foreground">
                  {achievement.title}
                </h3>
              </div>
              <p className="text-caption text-xs text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Réalisations récentes
        </h2>
        <Icon name="TrophyIcon" size={24} className="text-accent" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {achievements.slice(0, 4).map((achievement) => (
          <div
            key={achievement.id}
            className="relative rounded-md border border-border p-4 transition-academic hover:border-accent hover:shadow-academic-sm"
          >
            {achievement.isNew && (
              <span className="absolute -right-2 -top-2 rounded-full bg-accent px-2 py-1 text-caption text-xs font-medium text-accent-foreground shadow-academic-sm">
                Nouveau!
              </span>
            )}
            <div className="mb-2 flex items-center space-x-3">
              <div className="rounded-full bg-accent/10 p-2">
                <Icon name={achievement.icon as any} size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-caption text-sm font-medium text-foreground">
                  {achievement.title}
                </h3>
                <p className="text-caption text-xs text-muted-foreground">
                  {achievement.unlockedDate}
                </p>
              </div>
            </div>
            <p className="text-caption text-xs text-muted-foreground">
              {achievement.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges;
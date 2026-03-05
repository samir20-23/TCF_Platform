'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface WelcomeBannerProps {
  userName: string;
  motivationalMessage: string;
}

const WelcomeBanner = ({ userName, motivationalMessage }: WelcomeBannerProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setIsHydrated(true);
    const now = new Date();
    const hours = now.getHours();
    let greeting = 'Bonjour';
    if (hours < 12) {
      greeting = 'Bon matin';
    } else if (hours < 18) {
      greeting = 'Bon après-midi';
    } else {
      greeting = 'Bonsoir';
    }
    setCurrentTime(greeting);
  }, []);

  const displayGreeting = isHydrated ? currentTime : 'Bonjour';

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-secondary p-8 shadow-academic-lg">
      <div className="absolute right-0 top-0 opacity-10">
        <Icon name="AcademicCapIcon" size={200} className="text-primary-foreground" />
      </div>

      <div className="relative z-10">
        <div className="mb-2 flex items-center space-x-2">
          <Icon name="SparklesIcon" size={24} className="text-accent" />
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">
            {displayGreeting}, {userName}!
          </h1>
        </div>
        <p className="font-caption text-lg text-primary-foreground/90">
          {motivationalMessage}
        </p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
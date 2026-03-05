'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

const BulkActionsBar = ({ selectedCount, onClearSelection, onBulkAction }: BulkActionsBarProps) => {
  const [selectedAction, setSelectedAction] = useState('');

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
  };

  const handleExecuteAction = () => {
    if (selectedAction) {
      onBulkAction(selectedAction);
      setSelectedAction('');
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div >

    </div>
  );
};

export default BulkActionsBar;
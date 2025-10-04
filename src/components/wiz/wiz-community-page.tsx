// Community Command Center - Unified Community + ZAP Rewards Hub
import React from 'react';
import { CommunityCommandCenter } from './community/CommunityCommandCenter';

interface WizCommunityPageProps {
  onSectionChange?: (section: string) => void;
}

export const WizCommunityPage: React.FC<WizCommunityPageProps> = ({ onSectionChange }) => {
  return <CommunityCommandCenter onSectionChange={onSectionChange} />;
};

export default WizCommunityPage;

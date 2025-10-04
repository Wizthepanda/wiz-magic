// Community Page - Redesigned V2 with ZAP Rewards Hub aesthetics
import React from 'react';
import { CommunityPage as NewCommunityPage } from './community/CommunityPage';

interface WizCommunityPageProps {
  onSectionChange?: (section: string) => void;
}

export const WizCommunityPage: React.FC<WizCommunityPageProps> = ({ onSectionChange }) => {
  return <NewCommunityPage onSectionChange={onSectionChange} />;
};

export default WizCommunityPage;

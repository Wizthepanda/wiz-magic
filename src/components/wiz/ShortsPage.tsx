import React from "react";
import { WizXPShortsScreen } from "./WizXPShortsScreen";
import { useNavigate } from "react-router-dom";

interface ShortsPageProps {
  initialShortId?: string;
}

export const ShortsPage: React.FC<ShortsPageProps> = ({ initialShortId }) => {
  const navigate = useNavigate();

  return (
    <WizXPShortsScreen
      initialShortId={initialShortId}
      onClose={() => navigate('/')}
    />
  );
};
import React from "react";
import { WizXPShortsScreen } from "./WizXPShortsScreen";
import { useSafeNavigate } from "@/hooks/useSafeNavigate";

interface ShortsPageProps {
  initialShortId?: string;
}

export const ShortsPage: React.FC<ShortsPageProps> = ({ initialShortId }) => {
  const navigate = useSafeNavigate();

  return (
    <WizXPShortsScreen
      initialShortId={initialShortId}
      onClose={() => navigate('/')}
    />
  );
};
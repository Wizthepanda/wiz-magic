import { WizXPShortsDesktop } from "@/components/wiz/WizXPShortsDesktop";
import { useSafeNavigate } from "@/hooks/useSafeNavigate";

const Shorts = () => {
  const navigate = useSafeNavigate();
  
  return (
    <WizXPShortsDesktop 
      onClose={() => navigate('/')}
    />
  );
};

export default Shorts;
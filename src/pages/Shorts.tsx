import { WizXPShortsDesktop } from "@/components/wiz/WizXPShortsDesktop";
import { useNavigate } from "react-router-dom";

const Shorts = () => {
  const navigate = useNavigate();
  
  return (
    <WizXPShortsDesktop 
      onClose={() => navigate('/')}
    />
  );
};

export default Shorts;
import { Button } from "@/components/ui/button";

export const CommunityRightPanel = ({ community }: { community: any }) => {
  if (!community) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-lg">{community.name}</h3>
        <Button size="sm">Join</Button>
      </div>
      <p className="text-gray-600 text-sm mb-4">{community.description}</p>
      <div className="text-sm text-gray-500">
        <p>👥 {community.members || community.memberCount || 0} members</p>
        <p>🕒 Active now</p>
      </div>
    </div>
  );
};

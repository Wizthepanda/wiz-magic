import React from "react";
import { motion } from "framer-motion";
import { Users, Crown, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Member } from "@/types/community";

interface MembersGridProps {
  communityId: string;
}

export function MembersGrid({ communityId }: MembersGridProps) {
  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ['communityMembers', communityId],
    queryFn: async () => {
      const membersRef = collection(db, 'communities', communityId, 'members');
      const snapshot = await getDocs(membersRef);
      
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().displayName || doc.data().name || 'Member',
        displayName: doc.data().displayName,
        avatarUrl: doc.data().avatarUrl || doc.data().photoURL,
        photoURL: doc.data().photoURL,
        level: doc.data().level || Math.floor(Math.random() * 15) + 1,
        role: doc.data().role || 'member',
        joinedAt: doc.data().joinedAt?.toDate(),
        progress: doc.data().progress || 0,
      })) as Member[];
    },
    staleTime: 30000, // 30 seconds
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl p-12 bg-white/70 backdrop-blur-sm shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-slate-200"></div>
                <div className="h-3 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-12 bg-white/70 backdrop-blur-sm shadow-sm text-center"
      >
        <Users className="w-16 h-16 mx-auto text-slate-300 mb-3" />
        <h4 className="text-lg font-semibold text-slate-700">No members yet</h4>
        <p className="text-sm text-slate-500 mt-2">
          Be the first to join this community!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-6 bg-white/70 backdrop-blur-sm shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-semibold text-lg text-slate-900">
          Members ({members.length})
        </h4>
        <div className="text-sm text-slate-500">
          Active community
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((member, idx) => (
          <MemberCard key={member.uid} member={member} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}

function MemberCard({ member, index }: { member: Member; index: number }) {
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-amber-500" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-amber-100 text-amber-700 text-xs border-0">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-700 text-xs border-0">Mod</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative">
        <Avatar className="w-16 h-16 border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
          <AvatarImage src={member.avatarUrl || member.photoURL} />
          <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white text-lg">
            {(member.name || member.displayName || 'M')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {member.role && member.role !== 'member' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
            {getRoleIcon(member.role)}
          </div>
        )}
      </div>

      <div className="text-center space-y-1 w-full">
        <div className="font-medium text-slate-900 text-sm truncate px-2">
          {member.displayName || member.name || 'Member'}
        </div>
        
        <div className="flex items-center justify-center gap-2">
          {member.level && (
            <Badge variant="outline" className="text-xs">
              Lv. {member.level}
            </Badge>
          )}
          {getRoleBadge(member.role)}
        </div>

        {member.progress !== undefined && member.progress > 0 && (
          <div className="mt-2">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full transition-all"
                style={{ width: `${member.progress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {member.progress}% complete
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}


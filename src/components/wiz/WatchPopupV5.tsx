import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Bookmark } from "lucide-react"
import { useState } from "react"
import { TipModal } from './creator/components/TipModal'

interface WatchPopupProps {
  open: boolean
  onClose: () => void
  video?: {
    id: string
    videoId: string
    title: string
    description: string
    creator: {
      name: string
      avatar: string
      subscribers: string
      level?: number
    }
    views: string
    duration: string
    xpReward: number
  }
}

export function WatchPopupV5({ open, onClose, video }: WatchPopupProps) {
  const [showTipModal, setShowTipModal] = useState(false)

  // Default video data if none provided
  const defaultVideo = {
    id: "1",
    videoId: "dQw4w9WgXcQ",
    title: "Building a $10M SaaS Empire: The Complete Blueprint",
    description: "Learn the exact playbook I used to build multiple 8-figure companies from scratch. This comprehensive guide covers everything from initial product development to scaling systems.",
    creator: {
      name: "Alex Hormozi",
      avatar: "/creator-avatar.png",
      subscribers: "128K Subs",
      level: 7
    },
    views: "487K views",
    duration: "28:45",
    xpReward: 1250
  }

  const currentVideo = video || defaultVideo
  const watchProgress = 14 // 14% watched
  const earnedZaps = Math.floor((currentVideo.xpReward * watchProgress) / 100)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-[#f7f9fc] to-[#eef1f7] rounded-2xl p-6 shadow-2xl backdrop-blur-xl border-0">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Main Video Section */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Video */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={currentVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Watch Progress Bar */}
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${watchProgress}%` }}
                ></div>
              </div>

              {/* Progress + ZAPs */}
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Watching progress</span>
                <span className="font-medium">+{earnedZaps} / {currentVideo.xpReward} ⚡ ZAPs</span>
              </div>
            </div>

            {/* Creator Info + Action Row */}
            <div className="flex items-center justify-between mt-2">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 shadow-sm">
                  <AvatarImage src={currentVideo.creator.avatar} alt={currentVideo.creator.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-400 text-white text-sm font-medium">
                    {currentVideo.creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{currentVideo.creator.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white text-xs font-medium">
                      Lv.{currentVideo.creator.level || 7}
                    </span>
                  </div>
                  <span className="text-sm text-neutral-500">{currentVideo.creator.subscribers}</span>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center gap-3">
                <Button className="h-11 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-medium hover:from-indigo-600 hover:to-blue-500 transition-all">
                  Subscribe
                </Button>
                <Button
                  onClick={() => setShowTipModal(true)}
                  className="h-11 px-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-medium hover:from-green-600 hover:to-emerald-500 transition-all"
                >
                  Tip
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 w-11 rounded-full border bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 transition-all"
                >
                  <Share2 className="w-5 h-5 text-neutral-700" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 w-11 rounded-full border bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 transition-all"
                >
                  <Bookmark className="w-5 h-5 text-neutral-700" />
                </Button>
              </div>
            </div>

            {/* Video Title + Description */}
            <div className="flex flex-col gap-2 mt-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {currentVideo.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>{currentVideo.views}</span> •
                <span>{currentVideo.duration}</span> •
                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-medium">
                  +{currentVideo.xpReward} ⚡ ZAPs
                </span>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {currentVideo.description}
              </p>
            </div>
          </div>

          {/* Right: Up Next */}
          <div className="w-full md:w-72 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-neutral-800">Up Next</h3>
              <span className="text-xs text-neutral-500">7 videos</span>
            </div>
            <div className="flex flex-col gap-3">
              {/* Related Video Cards */}
              {[
                {
                  id: "2",
                  title: "Advanced React Patterns",
                  creator: "TechMaster Pro",
                  views: "124K views",
                  duration: "15:42",
                  zaps: 150,
                  thumbnail: "/thumb1.png"
                },
                {
                  id: "3",
                  title: "Building Wealth: 10 Proven Steps",
                  creator: "WealthBuilder",
                  views: "89K views",
                  duration: "22:15",
                  zaps: 200,
                  thumbnail: "/thumb2.png"
                },
                {
                  id: "4",
                  title: "Marketing Psychology Secrets",
                  creator: "MarketingGuru",
                  views: "156K views",
                  duration: "18:30",
                  zaps: 175,
                  thumbnail: "/thumb3.png"
                }
              ].map((relatedVideo) => (
                <div
                  key={relatedVideo.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-white/70"
                >
                  <div className="relative w-20 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-md overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <span className="text-xs text-neutral-500">Video</span>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                      {relatedVideo.duration}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1">
                      {relatedVideo.title}
                    </span>
                    <span className="text-xs text-neutral-500 mb-1">{relatedVideo.creator}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{relatedVideo.views}</span>
                      <span className="text-xs font-medium text-indigo-600">+{relatedVideo.zaps} ⚡</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={currentVideo.creator.name.toLowerCase().replace(/\s+/g, '')}
        creatorName={currentVideo.creator.name}
        creatorAvatar={currentVideo.creator.avatar}
      />
    </Dialog>
  )
}
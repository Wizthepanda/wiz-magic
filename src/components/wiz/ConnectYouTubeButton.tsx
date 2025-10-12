/**
 * Connect YouTube Button Component
 *
 * Optional YouTube connection button for Google-authenticated users.
 * Can be placed in:
 * - User Profile
 * - Creator Profile
 * - Create Tab
 *
 * Features:
 * - Shows connection status
 * - Triggers YouTube OAuth flow
 * - Displays channel info when connected
 * - Allows disconnection
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Youtube,
  Link2,
  CheckCircle,
  Loader2,
  XCircle,
  RefreshCw,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import YouTubeConnectionService, { YouTubeConnectionStatus } from '@/lib/youtube-connection-service';
import { useToast } from '@/hooks/use-toast';

interface ConnectYouTubeButtonProps {
  variant?: 'button' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showChannelInfo?: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

export const ConnectYouTubeButton = ({
  variant = 'button',
  size = 'md',
  showChannelInfo = true,
  onConnectionChange
}: ConnectYouTubeButtonProps) => {
  const { user, connectYouTube, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [status, setStatus] = useState<YouTubeConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);

  // Check connection status on mount
  useEffect(() => {
    if (user) {
      loadConnectionStatus();
    }
  }, [user]);

  const loadConnectionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const connectionStatus = await YouTubeConnectionService.getConnectionStatus(user.uid);
      setStatus(connectionStatus);
      onConnectionChange?.(connectionStatus.connected);
    } catch (error) {
      console.error('Error loading YouTube connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Google first",
        variant: "destructive"
      });
      return;
    }

    try {
      setConnecting(true);

      // ✅ Use redirect flow for reliable YouTube token acquisition
      // Popup flow doesn't reliably return access tokens for YouTube scope
      const success = await connectYouTube(false); // false = redirect flow

      if (success) {
        await loadConnectionStatus();
        toast({
          title: "YouTube Connected! 🎥",
          description: "Your YouTube channel is now linked successfully"
        });
        onConnectionChange?.(true);
      }
    } catch (error: any) {
      console.error('Error connecting YouTube:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect YouTube channel",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    try {
      setDisconnecting(true);
      const success = await YouTubeConnectionService.disconnectYouTube(user.uid);

      if (success) {
        setStatus({ connected: false });
        await refreshUserData();
        onConnectionChange?.(false);
        toast({
          title: "YouTube Disconnected",
          description: "Your YouTube channel has been unlinked"
        });
      }
    } catch (error) {
      console.error('Error disconnecting YouTube:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect YouTube channel",
        variant: "destructive"
      });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Button variant
  if (variant === 'button') {
    if (status.connected) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            YouTube Connected
          </Badge>
          <Button
            variant="outline"
            size={size}
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Disconnect
          </Button>
        </div>
      );
    }

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size={size}
          onClick={handleConnect}
          disabled={connecting}
          className="border-red-300 hover:bg-red-50 hover:border-red-400 transition-all"
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Youtube className="w-4 h-4 mr-2 text-red-600" />
          )}
          Connect YouTube Channel
        </Button>
      </motion.div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Youtube className={status.connected ? "text-red-600" : "text-slate-400"} />
                YouTube Connection
              </h3>
              <p className="text-sm text-slate-600">
                {status.connected
                  ? "Your YouTube channel is linked"
                  : "Connect your YouTube channel to sync content"}
              </p>
            </div>
            {status.connected && (
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>

          {status.connected && showChannelInfo && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Youtube className="w-10 h-10 text-red-600" />
                <div>
                  <div className="font-semibold text-slate-900">
                    {status.channelTitle}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Users className="w-3 h-3" />
                    {status.subscriberCount || '0'} subscribers
                  </div>
                  {status.lastSynced && (
                    <div className="text-xs text-slate-500 mt-1">
                      Last synced: {status.lastSynced.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {status.connected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex-1"
                >
                  {disconnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Disconnect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadConnectionStatus}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={connecting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                {connecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                Connect YouTube Channel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline variant
  return (
    <div className="flex items-center gap-3">
      {status.connected ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-slate-700">
              Connected to <span className="font-semibold">{status.channelTitle}</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          variant="link"
          size="sm"
          onClick={handleConnect}
          disabled={connecting}
          className="text-red-600 hover:text-red-700"
        >
          <Youtube className="w-4 h-4 mr-1" />
          Connect YouTube
        </Button>
      )}
    </div>
  );
};

export default ConnectYouTubeButton;

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Edit3,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Eye,
  Save,
  X,
  AlertCircle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface BannerUploadProps {
  value?: string;
  onChange: (value: string, positioning?: BannerPositioning) => void;
  className?: string;
}

interface BannerPositioning {
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

export const EnhancedBannerUpload: React.FC<BannerUploadProps> = ({
  value,
  onChange,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [positioning, setPositioning] = useState<BannerPositioning>({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewMode, setPreviewMode] = useState<'learn' | 'claim'>('learn');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setOriginalImage(imageUrl);
        setIsEditing(true);
        // Reset positioning
        setPositioning({ scale: 1, x: 0, y: 0, rotation: 0 });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const applyImageTransform = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas to 16:9 aspect ratio (800x450 for high quality)
      canvas.width = 800;
      canvas.height = 450;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((positioning.rotation * Math.PI) / 180);
      ctx.scale(positioning.scale, positioning.scale);
      ctx.translate(positioning.x, positioning.y);

      // Calculate image dimensions to fill 16:9 while maintaining aspect ratio
      const targetAspectRatio = 16 / 9;
      const imageAspectRatio = img.width / img.height;

      let drawWidth, drawHeight;
      if (imageAspectRatio > targetAspectRatio) {
        // Image is wider than 16:9
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageAspectRatio;
      } else {
        // Image is taller than 16:9
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageAspectRatio;
      }

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          onChange(url, positioning);
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = originalImage;
  }, [originalImage, positioning, onChange]);

  const handleSave = useCallback(() => {
    applyImageTransform();
    setIsEditing(false);
  }, [applyImageTransform]);

  const handleReset = useCallback(() => {
    setPositioning({ scale: 1, x: 0, y: 0, rotation: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - positioning.x, y: e.clientY - positioning.y });
  }, [positioning.x, positioning.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPositioning(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderPreview = (mode: 'learn' | 'claim') => {
    const bannerUrl = value || '/api/placeholder/800/450';

    if (mode === 'learn') {
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Learn Section Preview</h4>
          {/* Featured Course Preview */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden w-72">
            <div className="relative aspect-video">
              <img
                src={bannerUrl}
                alt="Course banner preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-green-500 text-white text-xs">Free</Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-gray-800" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 line-clamp-2">Your Course Title</h3>
              <p className="text-sm text-gray-600 mt-1">By You</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Claim Section Preview</h4>
          {/* Claim Card Preview */}
          <div
            className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden w-80"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.65) 100%)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}
          >
            <div className="relative aspect-video">
              <img
                src={bannerUrl}
                alt="Reward banner preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-red-500 text-white text-xs font-bold">75% OFF</Badge>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-800">Your Course Title</h3>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">By You</div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600 font-semibold text-sm">80 XP</span>
                  <span className="text-green-600 font-semibold text-sm">+ $59</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  if (isEditing && originalImage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("space-y-6", className)}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Adjust Banner Position</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Drag to position, use controls to scale and rotate. Your banner will be optimized for both Learn and Claim sections.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Editor */}
              <div className="space-y-4">
                <div
                  ref={containerRef}
                  className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div
                    className="absolute inset-0 origin-center transition-transform"
                    style={{
                      transform: `scale(${positioning.scale}) translate(${positioning.x}px, ${positioning.y}px) rotate(${positioning.rotation}deg)`,
                      backgroundImage: `url(${originalImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />

                  {/* Grid overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full border border-white/20">
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
                    </div>
                  </div>

                  {/* Center indicator */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/80 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                  {/* Instructions overlay */}
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                      <Move className="w-3 h-3 mr-1" />
                      Drag to reposition
                    </Badge>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Scale Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Scale</label>
                        <span className="text-sm text-gray-500">{positioning.scale.toFixed(2)}x</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPositioning(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Slider
                          value={[positioning.scale]}
                          onValueChange={([value]) => setPositioning(prev => ({ ...prev, scale: value }))}
                          min={0.5}
                          max={3}
                          step={0.1}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPositioning(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }))}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Rotation Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Rotation</label>
                        <span className="text-sm text-gray-500">{positioning.rotation}°</span>
                      </div>
                      <Slider
                        value={[positioning.rotation]}
                        onValueChange={([value]) => setPositioning(prev => ({ ...prev, rotation: value }))}
                        min={-45}
                        max={45}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as 'learn' | 'claim')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="learn" className="text-sm">Learn Preview</TabsTrigger>
                    <TabsTrigger value="claim" className="text-sm">Claim Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="learn" className="mt-4">
                    {renderPreview('learn')}
                  </TabsContent>
                  <TabsContent value="claim" className="mt-4">
                    {renderPreview('claim')}
                  </TabsContent>
                </Tabs>

                {/* Best Practices */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Banner Best Practices:</p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>Keep important text/logos in the center area</li>
                          <li>Avoid placing key elements near edges</li>
                          <li>Use high contrast for better readability</li>
                          <li>Test on both preview modes</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Image</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <canvas
          ref={canvasRef}
          className="hidden"
          width={800}
          height={450}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <label className="block text-sm font-semibold text-gray-700">
        Course Banner (16:9 aspect ratio recommended)
      </label>

      <div
        className="relative w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
        style={{
          backgroundImage: value ? `url(${value})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {!value ? (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 group-hover:text-gray-700 font-medium">
                Click to upload banner image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Recommended: 1600×900px or 1920×1080px (16:9 ratio)
              </p>
              <p className="text-xs text-gray-400">
                Max size: 5MB • Formats: JPG, PNG, WebP
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Position
              </Button>
              <Button variant="secondary" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Replace Image
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {value && (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Adjust Position</span>
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Replace</span>
          </Button>
        </div>
      )}

      {/* Preview Grid */}
      {value && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          {renderPreview('learn')}
          {renderPreview('claim')}
        </div>
      )}
    </div>
  );
};
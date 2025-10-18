import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, X, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course, DuplicateCheckResult } from '@/lib/course-service';

interface DuplicateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  duplicateResult: DuplicateCheckResult;
  onUpdate: () => void;
  onPublishNew: () => void;
}

export const DuplicateCourseDialog: React.FC<DuplicateCourseDialogProps> = ({
  open,
  onClose,
  duplicateResult,
  onUpdate,
  onPublishNew,
}) => {
  const { existingCourse, duplicateType, matchPercentage } = duplicateResult;

  if (!existingCourse) return null;

  const getDuplicateTypeLabel = () => {
    switch (duplicateType) {
      case 'youtube':
        return 'YouTube Video Match';
      case 'content-hash':
        return 'Identical Content';
      case 'title-similarity':
        return 'Same Title';
      default:
        return 'Duplicate Detected';
    }
  };

  const getDuplicateTypeDescription = () => {
    switch (duplicateType) {
      case 'youtube':
        return `This course contains YouTube videos that match ${matchPercentage?.toFixed(0)}% with an existing course.`;
      case 'content-hash':
        return 'This course has identical content to an existing course.';
      case 'title-similarity':
        return 'A course with the same title already exists.';
      default:
        return 'This course appears to be a duplicate of an existing course.';
    }
  };

  const getWarningLevel = (): 'high' | 'medium' | 'low' => {
    if (duplicateType === 'content-hash') return 'high';
    if (duplicateType === 'youtube' && (matchPercentage || 0) >= 80) return 'high';
    if (duplicateType === 'youtube' && (matchPercentage || 0) >= 50) return 'medium';
    return 'low';
  };

  const warningLevel = getWarningLevel();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`p-2 rounded-full ${
                warningLevel === 'high'
                  ? 'bg-red-100'
                  : warningLevel === 'medium'
                  ? 'bg-yellow-100'
                  : 'bg-orange-100'
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  warningLevel === 'high'
                    ? 'text-red-600'
                    : warningLevel === 'medium'
                    ? 'text-yellow-600'
                    : 'text-orange-600'
                }`}
              />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Duplicate Course Detected
              </DialogTitle>
              <Badge
                variant="outline"
                className={`mt-1 ${
                  warningLevel === 'high'
                    ? 'border-red-300 text-red-700'
                    : warningLevel === 'medium'
                    ? 'border-yellow-300 text-yellow-700'
                    : 'border-orange-300 text-orange-700'
                }`}
              >
                {getDuplicateTypeLabel()}
                {matchPercentage && ` • ${matchPercentage.toFixed(0)}% Match`}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-base">
            {getDuplicateTypeDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Existing Course Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Existing Course
          </h4>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {existingCourse.title}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {existingCourse.description}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="font-medium">Category:</span>
                <span>{existingCourse.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">Version:</span>
                <span>{existingCourse.version || 1}</span>
              </div>
              {existingCourse.enrollmentCount > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Students:</span>
                  <span>{existingCourse.enrollmentCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700">
              <strong>Updating your course</strong> will create a new version and you'll be eligible for ZAPs.
              However, <strong>publishing the same content as a separate course</strong> will not earn additional rewards.
            </p>
          </div>

          {duplicateType === 'youtube' && (matchPercentage || 0) < 100 && (
            <div className="flex items-start space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">
                This appears to be a partial match. You can update the existing course
                or publish as a new course if the content is substantially different.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <Button
            variant="default"
            onClick={onUpdate}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Existing Course
          </Button>

          {duplicateType === 'title-similarity' ||
          (duplicateType === 'youtube' && (matchPercentage || 0) < 80) ? (
            <Button
              variant="secondary"
              onClick={onPublishNew}
              className="w-full sm:w-auto"
            >
              Publish as New Course
            </Button>
          ) : null}
        </DialogFooter>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>What happens when you update?</strong> A new version of the course will
            be created, and the existing course will be marked as an older version. Students
            enrolled in the old version will be notified of the update.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateCourseDialog;

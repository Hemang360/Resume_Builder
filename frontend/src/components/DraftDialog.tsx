import React from 'react'
import { useResumeContext } from '@/contexts/ResumeContext'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Clock, AlertTriangle } from 'lucide-react'

const DraftDialog: React.FC = () => {
  const { 
    showDraftDialog, 
    getDraftPreview, 
    restoreDraft, 
    discardDraft 
  } = useResumeContext()

  const draftData = getDraftPreview()

  if (!showDraftDialog || !draftData) {
    return null
  }

  const editCount = draftData.localEdits.length
  const lastEdit = draftData.localEdits[draftData.localEdits.length - 1]
  const lastEditTime = lastEdit ? new Date(lastEdit.timestamp) : new Date()

  return (
    <Dialog open={showDraftDialog} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle>Draft Found</DialogTitle>
              <DialogDescription>
                We found unsaved changes from a previous session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>
                Last edited: {lastEditTime.toLocaleDateString()} at{' '}
                {lastEditTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <strong>{editCount}</strong> unsaved change{editCount !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Recent changes include:
            </h4>
            <div className="space-y-1">
              {draftData.localEdits.slice(-3).map((edit, index) => (
                <div key={index} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded px-2 py-1">
                  <code className="font-mono">{edit.path}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Your changes will be merged with the current version. 
              If there are conflicts, your local changes will take precedence.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={discardDraft}
            className="flex-1"
          >
            Discard Draft
          </Button>
          <Button
            onClick={restoreDraft}
            className="flex-1"
          >
            Restore Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DraftDialog
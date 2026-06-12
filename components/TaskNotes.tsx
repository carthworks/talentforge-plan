'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';

interface TaskNotesProps {
  taskKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskNotes({ taskKey, isOpen, onClose }: TaskNotesProps) {
  const { getTaskNote, setTaskNote } = useStore();
  const { toast } = useToast();
  const [noteText, setNoteText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize text when taskKey changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setNoteText(getTaskNote(taskKey));
      // Focus textarea when opened
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [taskKey, isOpen, getTaskNote]);

  if (!isOpen) return null;

  const handleSave = () => {
    setTaskNote(taskKey, noteText.trim());
    toast('Task note saved successfully!', 'success');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className="task-notes-wrapper" onClick={(e) => e.stopPropagation()}>
      <div className="task-notes-editor">
        <div className="task-notes-label">
          <i className="ti ti-notes" aria-hidden="true" />
          <span>Task Notes & Comments</span>
        </div>
        <textarea
          ref={textareaRef}
          className="task-notes-textarea"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add comments, links, or follow-up notes for this task... (Ctrl+Enter to save)"
          onKeyDown={handleKeyDown}
        />
        <div className="task-notes-actions">
          <button
            type="button"
            className="task-notes-btn task-notes-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="task-notes-btn task-notes-btn-save"
            onClick={handleSave}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

// Small helper badge that can be displayed next to a task when it has notes
export function TaskNoteIndicator({ taskKey }: { taskKey: string }) {
  const { getTaskNote } = useStore();
  const hasNote = getTaskNote(taskKey).trim().length > 0;

  if (!hasNote) return null;

  return (
    <span className="task-notes-indicator" title="Has notes">
      <i className="ti ti-note" style={{ fontSize: 10 }} aria-hidden="true" />
      <span>Note</span>
    </span>
  );
}

'use client';
import { useState } from 'react';
import { User } from 'lucide-react';

interface Props {
  itemId: string;
  initialAssignee?: string;
  isMock?: boolean;
}

export function InlineAssigneeCell({ initialAssignee, isMock }: Props) {
  const [assignee, setAssignee] = useState(initialAssignee || '');
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        type="text"
        value={assignee}
        autoFocus
        onChange={e => setAssignee(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }}
        className="text-xs border border-blue-300 rounded px-2 py-0.5 w-24 focus:outline-none"
        placeholder="담당자 입력"
      />
    );
  }

  return (
    <button
      onClick={() => { if (!isMock) setEditing(true); }}
      className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 transition-colors"
      title={isMock ? '데모 모드' : '클릭하여 편집'}
    >
      <User size={12} className="text-slate-400" />
      <span>{assignee || <span className="text-slate-300 italic">미배정</span>}</span>
    </button>
  );
}

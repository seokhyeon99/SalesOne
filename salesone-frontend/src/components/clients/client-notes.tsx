import { useClientNotes } from '@/hooks/use-client-notes';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { AddNoteDialog } from './add-note-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClientNotesProps {
  clientId: string;
}

export function ClientNotes({ clientId }: ClientNotesProps) {
  const { notes, isLoading, createNote, deleteNote } = useClientNotes(clientId);

  const handleDelete = async (noteId: string) => {
    if (!confirm('정말로 이 노트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNote(noteId);
      toast.success('노트가 삭제되었습니다.');
    } catch (error) {
      toast.error('노트 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">노트</h3>
        <AddNoteDialog onSubmit={createNote} />
      </div>

      {notes?.length === 0 ? (
        <p className="text-sm text-muted-foreground">등록된 노트가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {notes?.map((note) => (
            <div
              key={note.id}
              className="p-4 border rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    작성자: {note.user.email} • {formatDate(note.created_at)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(note.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
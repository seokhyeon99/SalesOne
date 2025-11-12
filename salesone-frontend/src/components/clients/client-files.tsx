import { useClientFiles } from '@/hooks/use-client-files';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { FileText, Trash2 } from 'lucide-react';
import { AddFileDialog } from './add-file-dialog';

interface ClientFilesProps {
  clientId: string;
}

export function ClientFiles({ clientId }: ClientFilesProps) {
  const { files, isLoading, uploadFile, deleteFile } = useClientFiles(clientId);

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
        <h3 className="text-lg font-semibold">파일</h3>
        <AddFileDialog onSubmit={uploadFile} />
      </div>

      {files?.length === 0 ? (
        <p className="text-sm text-muted-foreground">등록된 파일이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {files?.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    {file.name}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(file.created_at)} • {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteFile(file.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
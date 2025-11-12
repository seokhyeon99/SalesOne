import { useClientEmails } from '@/hooks/use-client-emails';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { FileText, Mail, CheckCircle2, XCircle, Eye, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClientEmailsProps {
  clientId: string;
}

export function ClientEmails({ clientId }: ClientEmailsProps) {
  const { emails, isLoading } = useClientEmails(clientId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'opened':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'clicked':
        return <MousePointerClick className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return '전송됨';
      case 'failed':
        return '실패';
      case 'opened':
        return '읽음';
      case 'clicked':
        return '클릭됨';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">이메일</h3>
      </div>

      {!emails?.length ? (
        <p className="text-sm text-muted-foreground">전송된 이메일이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{email.subject}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getStatusIcon(email.status)}
                      <span>{getStatusText(email.status)}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    받는사람: {email.recipient.name} ({email.recipient.email})
                  </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(email.sent_at)}
                </div>
              </div>
              
              <div className="text-sm whitespace-pre-wrap">{email.content}</div>

              {email.attachments && email.attachments.length > 0 && (
                <div className="border-t pt-3">
                  <div className="text-sm font-medium mb-2">첨부파일</div>
                  <div className="space-y-2">
                    {email.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {attachment.name}
                        </a>
                        <span className="text-muted-foreground">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
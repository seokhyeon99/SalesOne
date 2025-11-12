import { useClients } from '@/hooks/use-clients';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Client } from '@/types/client';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientDialog } from './client-dialog';

export function ClientList() {
  const { clients, isLoading } = useClients();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!clients?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-4">등록된 고객이 없습니다.</p>
        <ClientDialog mode="create" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">고객 목록</h2>
        <ClientDialog mode="create" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회사명</TableHead>
            <TableHead>대표자명</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>전화번호</TableHead>
            <TableHead>등록일</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.representative_name}</TableCell>
              <TableCell>{client.emails[0]}</TableCell>
              <TableCell>{client.phones[0]}</TableCell>
              <TableCell>{formatDate(client.created_at)}</TableCell>
              <TableCell className="text-right">
                <ClientDialog
                  mode="edit"
                  client={client}
                  trigger={
                    <Button variant="ghost" size="sm">
                      수정
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
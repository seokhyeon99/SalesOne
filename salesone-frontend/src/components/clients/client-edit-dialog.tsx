import { Client } from '@/types/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useClientActions } from '@/hooks/use-client-actions';
import { toast } from 'sonner';

const clientFormSchema = z.object({
  name: z.string().min(1, '회사명을 입력해주세요'),
  representative_name: z.string().min(1, '대표자명을 입력해주세요'),
  business_number: z.string().optional(),
  emails: z.array(z.string().email('올바른 이메일 형식이 아닙니다')),
  phones: z.array(z.string()),
  address: z.string().optional(),
  website: z.string().url('올바른 URL 형식이 아닙니다').optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientEditDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientEditDialog({
  client,
  open,
  onOpenChange,
}: ClientEditDialogProps) {
  const { updateClient } = useClientActions();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client.name,
      representative_name: client.representative_name,
      business_number: client.business_number,
      emails: client.emails,
      phones: client.phones,
      address: client.address,
      website: client.website,
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    try {
      await updateClient(client.id, data);
      toast.success('고객 정보가 수정되었습니다');
      onOpenChange(false);
    } catch (error) {
      toast.error('고객 정보 수정에 실패했습니다');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>고객 정보 수정</DialogTitle>
          <DialogDescription>
            고객의 정보를 수정합니다. 수정이 완료되면 저장 버튼을 클릭해주세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>회사명</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대표자명</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="business_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사업자등록번호</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value.join(', ')}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split(',').map((email) => email.trim())
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value.join(', ')}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split(',').map((phone) => phone.trim())
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>웹사이트</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit">저장</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
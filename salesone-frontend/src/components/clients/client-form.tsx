import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const clientFormSchema = z.object({
  name: z.string().min(1, "회사명을 입력해주세요"),
  representative_name: z.string().min(1, "대표자명을 입력해주세요"),
  business_number: z.string().optional(),
  emails: z.array(z.string().email("유효한 이메일을 입력해주세요")).min(1, "이메일을 입력해주세요"),
  phones: z.array(z.string()).min(1, "전화번호를 입력해주세요"),
  address: z.string().optional(),
  website: z.string().url("유효한 웹사이트 주소를 입력해주세요").optional(),
})

type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => Promise<void>
  defaultValues?: Partial<ClientFormValues>
}

export function ClientForm({ onSubmit, defaultValues }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      representative_name: "",
      business_number: "",
      emails: [""],
      phones: [""],
      address: "",
      website: "",
      ...defaultValues,
    },
  })

  const handleSubmit = async (data: ClientFormValues) => {
    try {
      await onSubmit(data)
      form.reset()
      toast.success("고객이 성공적으로 저장되었습니다")
    } catch (error) {
      toast.error("고객 저장에 실패했습니다")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>회사명</FormLabel>
              <FormControl>
                <Input placeholder="회사명을 입력하세요" {...field} />
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
                <Input placeholder="대표자명을 입력하세요" {...field} />
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
                <Input placeholder="사업자등록번호를 입력하세요" {...field} />
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
                  placeholder="이메일을 입력하세요" 
                  value={field.value[0]} 
                  onChange={(e) => field.onChange([e.target.value])}
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
                  placeholder="전화번호를 입력하세요" 
                  value={field.value[0]}
                  onChange={(e) => field.onChange([e.target.value])}
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
                <Textarea placeholder="주소를 입력하세요" {...field} />
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
                <Input placeholder="웹사이트 주소를 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit">저장</Button>
        </div>
      </form>
    </Form>
  )
} 
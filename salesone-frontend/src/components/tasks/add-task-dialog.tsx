import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClientTasks, CreateTaskData } from "@/hooks/use-client-tasks";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ko } from "date-fns/locale";

interface AddTaskDialogProps {
  clientId?: string;
  onTaskAdded?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "제목은 필수입니다"),
  body: z.string().min(1, "내용은 필수입니다"),
  attachWorkflow: z.boolean().default(false),
  workflowId: z.string().optional(),
  dueDate: z.date().optional(),
  isRepetitive: z.boolean().default(false),
  repetitionInterval: z.number().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'failed']).default('not_started'),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTaskDialog({ clientId = "", onTaskAdded }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { createTask } = useClientTasks(clientId);
  const [workflows, setWorkflows] = useState<{ id: string, name: string }[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      body: "",
      attachWorkflow: false,
      isRepetitive: false,
      status: 'not_started' as const,
    },
  });

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/workflows/workflows/active');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data = await response.json();
        setWorkflows(data);
      } catch (error) {
        console.error("Failed to fetch workflows", error);
        // Fallback to mock data if API is not available
        setWorkflows([
          { id: "1", name: "세금계산서 발행" },
          { id: "2", name: "견적서 발급" },
          { id: "3", name: "고객 미팅 알림" },
        ]);
      }
    };

    if (open) {
      fetchWorkflows();
    }
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    try {
      const taskData: CreateTaskData = {
        name: values.name,
        body: values.body,
        due_date: values.dueDate ? format(values.dueDate, "yyyy-MM-dd") : undefined,
        workflow_ids: values.attachWorkflow && values.workflowId ? [values.workflowId] : undefined,
        is_repetitive: values.isRepetitive,
        repetition_interval: values.isRepetitive ? values.repetitionInterval : undefined,
        status: values.status,
      };

      // Only add client_id if it's provided and not empty
      if (clientId) {
        taskData.client_id = clientId;
      }

      await createTask(taskData);
      setOpen(false);
      form.reset();
      toast.success("작업이 생성되었습니다.");
      
      // Call the onTaskAdded callback if provided
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error) {
      console.error("Task creation error:", error);
      let errorMessage = "작업 생성에 실패했습니다.";
      
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">작업 추가</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 작업 추가</DialogTitle>
          <DialogDescription>
            새로운 작업을 생성하세요. 아래 세부사항을 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="작업 제목" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="작업 설명" 
                      {...field} 
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="작업 상태 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not_started">해야할 일</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="failed">실패</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>기한</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ko })
                          ) : (
                            <span>날짜 선택</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="attachWorkflow"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>워크플로우 부착</FormLabel>
                    <FormDescription>
                      이 작업에 워크플로우를 부착합니다
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("attachWorkflow") && (
              <FormField
                control={form.control}
                name="workflowId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>워크플로우 선택</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="워크플로우 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workflows.map((workflow) => (
                          <SelectItem key={workflow.id} value={workflow.id}>
                            {workflow.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="isRepetitive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>반복 작업</FormLabel>
                    <FormDescription>
                      이 작업을 주기적으로 반복합니다
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("isRepetitive") && (
              <FormField
                control={form.control}
                name="repetitionInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>반복 주기 (일)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="몇 일마다 반복할지 입력하세요"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      작업이 몇 일마다 반복될지 입력하세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="submit">생성</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
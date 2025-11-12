"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Form schema for creating/editing lead lists
const leadListSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  description: z.string().optional(),
});

type LeadList = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  leads_count: number;
};

export default function LeadsPage() {
  const router = useRouter();
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof leadListSchema>>({
    resolver: zodResolver(leadListSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch lead lists
  const fetchLeadLists = async () => {
    try {
      const response = await fetch("/api/leads/lists");
      const data = await response.json();
      setLeadLists(data.results);
    } catch (error) {
      toast.error("리드 리스트를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadLists();
  }, []);

  // Create new lead list
  const onSubmit = async (values: z.infer<typeof leadListSchema>) => {
    try {
      const response = await fetch("/api/leads/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("리드 리스트 생성에 실패했습니다");

      toast.success("리드 리스트가 생성되었습니다");
      setIsCreateDialogOpen(false);
      form.reset();
      fetchLeadLists();
    } catch (error) {
      toast.error("리드 리스트 생성에 실패했습니다");
    }
  };

  // Delete lead list
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 리드 리스트를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/leads/lists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("리드 리스트 삭제에 실패했습니다");

      toast.success("리드 리스트가 삭제되었습니다");
      fetchLeadLists();
    } catch (error) {
      toast.error("리드 리스트 삭제에 실패했습니다");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">리드 리스트</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 리드 리스트
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 리드 리스트 만들기</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input placeholder="리드 리스트 이름" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Input placeholder="리드 리스트 설명 (선택사항)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  생성하기
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leadLists.map((list) => (
          <Card key={list.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{list.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/dashboard/leads/${list.id}`)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(list.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent
              onClick={() => router.push(`/dashboard/leads/${list.id}`)}
              className="pt-2"
            >
              <p className="text-sm text-muted-foreground">{list.description}</p>
              <p className="text-sm mt-2">리드 수: {list.leads_count}</p>
              <p className="text-sm text-muted-foreground">
                생성일: {new Date(list.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && leadLists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">리드 리스트가 없습니다. 새로운 리드 리스트를 만들어보세요.</p>
        </div>
      )}
    </div>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockEmailTemplates } from "@/lib/mock/campaigns";
import { Edit, PlusIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EmailTemplatesPage() {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    // TODO: Implement actual delete functionality
    toast.success("템플릿이 삭제되었습니다");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">이메일 템플릿</h1>
          <p className="text-muted-foreground">
            이메일 템플릿을 생성하고 관리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/email-templates/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            새 템플릿
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEmailTemplates.map((template) => (
          <Card key={template.id} className="p-4 space-y-4">
            <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
              <Image
                src={template.thumbnail}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.subject}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                asChild
              >
                <Link href={`/dashboard/campaigns/email-templates/${template.id}/edit`}>
                  <Edit className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(template.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
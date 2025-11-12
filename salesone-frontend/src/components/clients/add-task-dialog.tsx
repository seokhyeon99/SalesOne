import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    body: string;
    due_date: Date;
    is_repetitive: boolean;
    repetition_interval?: number;
    repetition_end_date?: Date;
  }) => Promise<void>;
}

export function AddTaskDialog({ isOpen, onOpenChange, onSubmit }: AddTaskDialogProps) {
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [isRepetitive, setIsRepetitive] = useState(false);
  const [repetitionInterval, setRepetitionInterval] = useState<number>();
  const [repetitionEndDate, setRepetitionEndDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        body,
        due_date: dueDate,
        is_repetitive: isRepetitive,
        ...(isRepetitive && repetitionInterval && {
          repetition_interval: repetitionInterval,
        }),
        ...(isRepetitive && repetitionEndDate && {
          repetition_end_date: repetitionEndDate,
        }),
      });
      onOpenChange(false);
      // Reset form
      setName('');
      setBody('');
      setDueDate(undefined);
      setIsRepetitive(false);
      setRepetitionInterval(undefined);
      setRepetitionEndDate(undefined);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 작업 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">작업명</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="작업명을 입력하세요"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">설명</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="작업 설명을 입력하세요"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>마감일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : '마감일을 선택하세요'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="repetitive"
              checked={isRepetitive}
              onCheckedChange={setIsRepetitive}
            />
            <Label htmlFor="repetitive">반복 작업</Label>
          </div>
          {isRepetitive && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interval">반복 주기 (일)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={1}
                  value={repetitionInterval || ''}
                  onChange={(e) => setRepetitionInterval(Number(e.target.value))}
                  placeholder="반복 주기를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label>반복 종료일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !repetitionEndDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {repetitionEndDate
                        ? format(repetitionEndDate, 'PPP')
                        : '반복 종료일을 선택하세요'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={repetitionEndDate}
                      onSelect={setRepetitionEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !name || !dueDate}>
              {isSubmitting ? '추가 중...' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
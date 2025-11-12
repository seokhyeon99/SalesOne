interface ClientCalendarProps {
  clientId: string;
}

export function ClientCalendar({ clientId }: ClientCalendarProps) {
  return (
    <div className="flex h-[450px] items-center justify-center">
      <p className="text-sm text-muted-foreground">캘린더 기능은 아직 준비중입니다.</p>
    </div>
  );
} 
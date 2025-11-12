"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface Option {
  label: string;
  value: number | string;
}

interface MultiSelectProps {
  options: Option[];
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "아이템을 선택하세요",
  isLoading = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabels = value
    .map((v) => options.find((opt) => opt.value === v)?.label)
    .filter(Boolean) as string[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[2.5rem]"
          disabled={isLoading}
        >
          <div className="flex gap-1 flex-wrap">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="mr-1 mb-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    const optionToRemove = options.find(
                      (opt) => opt.label === label
                    );
                    if (optionToRemove) {
                      onChange(
                        value.filter((v) => v !== optionToRemove.value)
                      );
                    }
                  }}
                >
                  {label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="검색..." />
          <CommandEmpty>
            {isLoading ? "로딩 중..." : "검색 결과가 없습니다"}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  const newValue = value.includes(option.value)
                    ? value.filter((v) => v !== option.value)
                    : [...value, option.value];
                  onChange(newValue);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MonthPickerProps = {
  months: string[]; // 可用的月份列表，例如 ["10月", "11月", "12月"]
  selected: string;
  onChange: (month: string) => void;
};

export default function MonthPicker({ months, selected, onChange }: MonthPickerProps) {
  if (months.length === 0) return null;

  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="選擇月份" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month} value={month}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


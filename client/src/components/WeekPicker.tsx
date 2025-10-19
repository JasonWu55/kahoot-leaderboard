import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type WeekPickerProps = {
  weekIds: string[];
  selectedWeek: string;
  onSelect: (weekId: string) => void;
};

export default function WeekPicker({
  weekIds,
  selectedWeek,
  onSelect,
}: WeekPickerProps) {
  if (weekIds.length === 0) {
    return null;
  }

  return (
    <Select value={selectedWeek} onValueChange={onSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="選擇週次" />
      </SelectTrigger>
      <SelectContent>
        {weekIds.map((weekId) => (
          <SelectItem key={weekId} value={weekId}>
            {weekId}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


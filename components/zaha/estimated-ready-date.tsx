"use client";

import { format } from "date-fns";
import { addDays } from "date-fns";

interface EstimatedReadyDateProps {
  daysToCraft: number;
}

export function EstimatedReadyDate({ daysToCraft }: EstimatedReadyDateProps): React.ReactElement {
  if (daysToCraft === 0) {
    return <span className="text-sm">Ready now</span>;
  }

  const readyDate = addDays(new Date(), daysToCraft);
  return (
    <span className="text-sm">
      Estimated ready by: <strong>{format(readyDate, "EEE, d MMM")}</strong>
    </span>
  );
}


import { useMemo } from 'react';
import { ILog } from '../types';
import { fuzzy } from 'fast-fuzzy';

export function useGroupLogs(
  logs: ILog[] | undefined,
  type: ILog['type']
): Record<string, ILog[]> {
  const stripSymbols = (description: string) => {
    return description
      .replace(/\s*[-–—:]\s*\d+.*$/g, '') // Remove trailing episode numbers and everything after
      .replace(/\s+\d+\s*$/, '') // Remove standalone trailing numbers
      .trim();
  };

  return useMemo(() => {
    if (!logs) return {};
    const groupedLogs = new Map<string, ILog[]>();
    logs.forEach((log) => {
      if (!log.description || log.type !== type || log.mediaId) return;
      let strippedDescription = log.description;
      if (type !== 'video') strippedDescription = stripSymbols(log.description);
      let foundGroup = false;
      for (const [key, group] of groupedLogs) {
        if (fuzzy(key, strippedDescription) > 0.8) {
          group.push(log);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        groupedLogs.set(strippedDescription, [log]);
      }
    });

    // Merge groups with the exact same name
    const mergedGroups: Record<string, ILog[]> = {};
    groupedLogs.forEach((logs, description) => {
      if (mergedGroups[description]) {
        mergedGroups[description].push(...logs);
      } else {
        mergedGroups[description] = logs;
      }
    });

    return mergedGroups;
  }, [logs, type]);
}

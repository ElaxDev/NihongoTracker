import { useMemo } from 'react';
import { ILog } from '../types';

export function useFilteredGroupedLogs(logs: ILog[] | undefined, groupedLogs: ILog[][], assignedLogs: ILog[]) {
    return useMemo(() => {
        if (!logs) return [];
        return groupedLogs
            ?.map((group) => {
                const filteredGroup = group.filter(
                    (log) => !assignedLogs.includes(log)
                );
                return filteredGroup.length > 0 ? filteredGroup : null;
            })
            .filter((group) => !!group);
    }, [groupedLogs, assignedLogs, logs]);
}
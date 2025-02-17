import * as React from 'react';
import {
  useK8sWatchResource,
  WatchK8sResource,
} from '@console/internal/components/utils/k8s-watch-hook';
import { VirtualMachineRestoreModel } from '../../models';
import { getVmRestoreSnapshotName, getVmRestoreTime } from '../../selectors/snapshot/snapshot';
import { VMRestore } from '../../types';

export const useMappedVMRestores = (
  namespace: string,
): [{ [key: string]: VMRestore }, boolean, any] => {
  const restoreResource: WatchK8sResource = {
    isList: true,
    kind: VirtualMachineRestoreModel.kind,
    namespaced: true,
    namespace,
  };

  const [restores, restoresLoaded, restoresError] = useK8sWatchResource<VMRestore[]>(
    restoreResource,
  );

  return React.useMemo(
    () => [
      restores.reduce((restoreMap, currentRestore) => {
        const relevantRestore = restoreMap[getVmRestoreSnapshotName(currentRestore)];
        if (
          !relevantRestore ||
          new Date(getVmRestoreTime(relevantRestore)).getTime() <
            new Date(getVmRestoreTime(currentRestore)).getTime()
        ) {
          restoreMap[getVmRestoreSnapshotName(currentRestore)] = currentRestore;
        }
        return restoreMap;
      }, {}),
      restoresLoaded,
      restoresError,
    ],
    [restores, restoresError, restoresLoaded],
  );
};

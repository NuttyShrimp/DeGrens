import { useBusinessAppStore } from './stores/useBusinessAppStore';

export const events: Phone.Events = {};

events.setBusinessPermissionLabels = (labels: Record<string, string>) => {
  useBusinessAppStore.setState({
    permissionLabels: labels,
  });
};

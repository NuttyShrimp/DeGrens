import { Tooltip as MUIToolTip, TooltipProps } from '@mui/material';

// Tooltip needs a reference to our child
// With wrapping this in a div we can make sure the ref is always accessible
export const Tooltip = ({ children, ...props }: TooltipProps) => (
  <MUIToolTip {...props}>
    <div>{children}</div>
  </MUIToolTip>
);

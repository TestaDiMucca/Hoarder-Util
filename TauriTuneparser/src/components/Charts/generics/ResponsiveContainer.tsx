import React from 'react';
import {
  ResponsiveContainer as DefaultResponsiveContainer,
  ResponsiveContainerProps,
} from 'recharts';
import { CHART_SIZE } from './charts.constants';

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  ...rest
}) => (
  <DefaultResponsiveContainer
    minHeight={CHART_SIZE}
    minWidth={CHART_SIZE * 2}
    {...rest}
  >
    {children}
  </DefaultResponsiveContainer>
);

export default ResponsiveContainer;

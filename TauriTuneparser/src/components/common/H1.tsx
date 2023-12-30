import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

const H1: React.FC<TextProps> = ({ children, ...textProps }) => (
  <Text fontSize="large" fontWeight="semibold" {...textProps}>
    {children}
  </Text>
);

export default H1;

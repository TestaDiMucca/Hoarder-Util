import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

const H2: React.FC<TextProps> = ({ children, ...textProps }) => (
  <Text fontSize="medium" fontWeight="semibold" {...textProps}>
    {children}
  </Text>
);

export default H2;

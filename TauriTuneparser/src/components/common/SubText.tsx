import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

const SubText: React.FC<TextProps> = ({ children, ...textProps }) => (
  <Text fontSize="xs" color="gray.400" {...textProps}>
    {children}
  </Text>
);

export default SubText;

import React from 'react';
import { useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-paper';

export default function ResponsiveTextField(props) {
  const { width } = useWindowDimensions();
  
  // 600 is roughly equivalent to MUI's 'sm' breakpoint (mobile devices)
  const isMobile = width < 600; 

  return (
    <TextInput 
      dense={isMobile} 
      {...props} 
    />
  );
}
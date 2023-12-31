import { Box, IconButton } from '@chakra-ui/react';
import SettingsIcon from '@mui/icons-material/Settings';

import useToggleState from 'src/hooks/useToggleState';
import ConfigurationModal from '../Configuration';
import { colors } from 'src/utils/palettes';

export default function BottomBar() {
  const modalStates = useToggleState(['config']);
  return (
    <Box
      w="full"
      position="absolute"
      bottom="4"
      h="10"
      p="2"
      boxSizing="border-box"
      display="flex"
      borderTop={`1px solid ${colors.blue}`}
    >
      <IconButton
        onClick={modalStates.config.on}
        icon={<SettingsIcon />}
        aria-label="Configuration"
      />
      <ConfigurationModal
        isOpen={modalStates.config.isOn}
        onClose={modalStates.config.off}
      />
    </Box>
  );
}

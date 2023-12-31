import {
  Modal,
  ModalOverlay,
  ModalBody,
  Image,
  ModalContent,
  Text,
} from '@chakra-ui/react';

import useUiState from 'src/hooks/useUiState';

/**
 * This is a big blocking loader, only use it for big things
 */
export default function Loader() {
  const { loading } = useUiState();

  return (
    <Modal
      isOpen={loading}
      onClose={() => {}}
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(5px) hue-rotate(90deg)" />
      <ModalContent>
        <ModalBody>
          <Image w="sm" src="src/assets/umu.gif" />
          <Text mt="2" textAlign="center">
            Processing...
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  Button,
  Textarea,
  RadioGroup,
  Radio,
  VStack,
  useToast,
  Stack,
  Box,
} from '@chakra-ui/react';
import { ChangeEvent, useCallback, useState } from 'react';
import {
  Classifications,
  VideoIncludeSettings,
  VideoInclusion,
} from 'src/utils/configs';
import H2 from './common/H2';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ConfigurationModal({ isOpen, onClose }: Props) {
  const [videoSettings, setVideoSettings] = useState(VideoInclusion.get());
  const [classifications, setClassifications] = useState(Classifications.get());

  const toast = useToast();

  const handleChangeVideoSettings = useCallback(
    (s: VideoIncludeSettings) => setVideoSettings(s),
    []
  );

  const handleChangeClassifications = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setClassifications(e.target.value);
    },
    []
  );

  const handleSave = useCallback(() => {
    Classifications.set(classifications);
    VideoInclusion.set(videoSettings);

    toast({
      title: 'Settings saved!',
      status: 'success',
    });

    onClose();
  }, [videoSettings, classifications, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            <Box>
              <H2>Classifications</H2>
              <Textarea
                placeholder="Classifications"
                onChange={handleChangeClassifications}
                value={classifications}
              />
            </Box>
            <Box>
              <H2>Video settings</H2>
              <RadioGroup
                value={videoSettings}
                onChange={handleChangeVideoSettings}
              >
                <VStack alignItems="flex-start">
                  <Radio value={VideoIncludeSettings.include}>Include</Radio>
                  <Radio value={VideoIncludeSettings.exclude}>Exclude</Radio>
                  <Radio value={VideoIncludeSettings.only}>Only</Radio>
                </VStack>
              </RadioGroup>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { TextVariant } from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getNonTestNetworks, getTestNetworks } from '../../../selectors/index';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Checkbox,
  Text,
  Box,
} from '../../component-library';
import { NetworkListItem } from '../index';

export const EditNetworksModal = ({ onClose }) => {
  const t = useI18nContext();
  const nonTestNetworks = useSelector(getNonTestNetworks);
  const testNetworks = useSelector(getTestNetworks);
  return (
    <Modal
      isOpen
      onClose={() => {
        onClose();
      }}
      className="import-nfts-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          onClose={() => {
            onClose();
          }}
        >
          {t('editNetworksTitle')}
        </ModalHeader>
        <Box padding={4}>
          <Checkbox
            label={t('selectAll')}
            isChecked={true}
            // onClick={() => (allAreSelected() ? deselectAll() : selectAll())}
            // isIndeterminate={isIndeterminate}
          />
        </Box>
        {nonTestNetworks.map((network) => (
          <NetworkListItem
            name={network.nickname}
            iconSrc={network?.rpcPrefs?.imageUrl}
            key={network.id}
            onClick={() => {
              console.log(network.id);
            }}
            startAccessory={<Checkbox isChecked={true} />}
          />
        ))}
        <Box padding={4}>
          <Text variant={TextVariant.bodyMdMedium}>{t('testnets')}</Text>
        </Box>
        {testNetworks.map((network) => (
          <NetworkListItem
            name={network.nickname}
            iconSrc={network?.rpcPrefs?.imageUrl}
            key={network.id}
            onClick={() => {
              console.log(network.id);
            }}
            startAccessory={<Checkbox isChecked={true} />}
            showEndAccessory={false}
          />
        ))}
      </ModalContent>
    </Modal>
  );
};

EditNetworksModal.propTypes = {
  /**
   * Executes when the modal closes
   */
  onClose: PropTypes.func.isRequired,
};

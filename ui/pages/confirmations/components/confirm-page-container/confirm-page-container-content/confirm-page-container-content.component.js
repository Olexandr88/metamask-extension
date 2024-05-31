import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Tabs, Tab } from '../../../../../components/ui/tabs';
import {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  Button,
  BUTTON_SIZES,
  BUTTON_VARIANT,
  ///: END:ONLY_INCLUDE_IF
  BannerAlert,
} from '../../../../../components/component-library';
import { PageContainerFooter } from '../../../../../components/ui/page-container';
import {
  INSUFFICIENT_FUNDS_ERROR_KEY,
  IS_SIGNING_OR_SUBMITTING,
  USER_OP_CONTRACT_DEPLOY_ERROR_KEY,
} from '../../../../../helpers/constants/error-keys';
import { Severity } from '../../../../../helpers/constants/design-system';

import { BlockaidResultType } from '../../../../../../shared/constants/security-provider';
import { ConfirmPageContainerSummary, ConfirmPageContainerWarning } from '.';
import { hashMessage } from '@ethersproject/hash';
import { verifyMessage } from '@ethersproject/wallet';
import { FIRST_PARTY_CONTRACT_NAMES } from '../../../../../../shared/constants/first-party-contracts';
import { TRUSTED_BRIDGE_SIGNER } from '../../../../../../shared/constants/bridge';
import { useSelector } from 'react-redux';
import { getCurrentChainId } from '../../../../../selectors';

export default class ConfirmPageContainerContent extends Component {
  static contextTypes = {
    t: PropTypes.func.isRequired,
    ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
    trackEvent: PropTypes.func,
    ///: END:ONLY_INCLUDE_IF
  };

  static propTypes = {
    action: PropTypes.string,
    dataHexComponent: PropTypes.node,
    detailsComponent: PropTypes.node,
    insightComponent: PropTypes.node,
    errorKey: PropTypes.string,
    errorMessage: PropTypes.string,
    tokenAddress: PropTypes.string,
    nonce: PropTypes.string,
    subtitleComponent: PropTypes.node,
    image: PropTypes.string,
    titleComponent: PropTypes.node,
    warning: PropTypes.string,
    origin: PropTypes.string.isRequired,
    ethGasPriceWarning: PropTypes.string,
    // Footer
    onCancelAll: PropTypes.func,
    onCancel: PropTypes.func,
    cancelText: PropTypes.string,
    onSubmit: PropTypes.func,
    submitText: PropTypes.string,
    disabled: PropTypes.bool,
    unapprovedTxCount: PropTypes.number,
    rejectNText: PropTypes.string,
    supportsEIP1559: PropTypes.bool,
    hasTopBorder: PropTypes.bool,
    nativeCurrency: PropTypes.string,
    networkName: PropTypes.string,
    toAddress: PropTypes.string,
    transactionType: PropTypes.string,
    isBuyableChain: PropTypes.bool,
    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
    openBuyCryptoInPdapp: PropTypes.func,
    ///: END:ONLY_INCLUDE_IF
    ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
    noteComponent: PropTypes.node,
    ///: END:ONLY_INCLUDE_IF
    txData: PropTypes.object,
    chainId: PropTypes.string,
  };

  renderContent() {
    const { detailsComponent, dataHexComponent, insightComponent } = this.props;

    if (insightComponent && (detailsComponent || dataHexComponent)) {
      return this.renderTabs();
    }

    ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
    const { noteComponent } = this.props;

    if (noteComponent) {
      return this.renderTabs();
    }
    ///: END:ONLY_INCLUDE_IF

    if (detailsComponent && dataHexComponent) {
      return this.renderTabs();
    }

    return detailsComponent || insightComponent;
  }

  renderTabs() {
    const { t } = this.context;
    const {
      detailsComponent,
      dataHexComponent,
      ///: BEGIN:ONLY_INCLUDE_IF(snaps)
      insightComponent,
      ///: END:ONLY_INCLUDE_IF
      ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
      noteComponent,
      ///: END:ONLY_INCLUDE_IF
    } = this.props;

    return (
      <Tabs defaultActiveTabKey="details">
        <Tab
          className="confirm-page-container-content__tab"
          name={t('details')}
          tabKey="details"
        >
          {detailsComponent}
        </Tab>
        {
          ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
          noteComponent && (
            <Tab
              data-testid="note-tab"
              className="confirm-page-container-content__tab"
              name={t('note')}
              tabKey="note"
              onClick={() => {
                this.context.trackEvent({
                  category: 'Note to trader',
                  event: 'Clicked on Notes tab on a transaction window',
                });
              }}
            >
              {noteComponent}
            </Tab>
          )
          ///: END:ONLY_INCLUDE_IF
        }
        {dataHexComponent && (
          <Tab
            className="confirm-page-container-content__tab"
            name={t('dataHex')}
            tabKey="dataHex"
          >
            {dataHexComponent}
          </Tab>
        )}

        {
          ///: BEGIN:ONLY_INCLUDE_IF(snaps)
          insightComponent
          ///: END:ONLY_INCLUDE_IF
        }
      </Tabs>
    );
  }

  render() {
    const {
      action,
      errorKey,
      errorMessage,
      image,
      titleComponent,
      subtitleComponent,
      tokenAddress,
      nonce,
      detailsComponent,
      warning,
      onCancelAll,
      onCancel,
      cancelText,
      onSubmit,
      submitText,
      disabled,
      unapprovedTxCount,
      rejectNText,
      origin,
      ethGasPriceWarning,
      supportsEIP1559,
      hasTopBorder,
      nativeCurrency,
      networkName,
      toAddress,
      transactionType,
      isBuyableChain,
      ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
      openBuyCryptoInPdapp,
      ///: END:ONLY_INCLUDE_IF
      txData,
      chainId,
    } = this.props;

    const { t } = this.context;

    const showInsuffienctFundsError =
      (errorKey || errorMessage) && errorKey === INSUFFICIENT_FUNDS_ERROR_KEY;

    const showIsSigningOrSubmittingError =
      errorKey === IS_SIGNING_OR_SUBMITTING;

    const showUserOpContractDeployError =
      errorKey === USER_OP_CONTRACT_DEPLOY_ERROR_KEY;

    const submitButtonType =
      txData?.securityAlertResponse?.result_type ===
      BlockaidResultType.Malicious
        ? 'danger-primary'
        : 'primary';

    const params = txData['txParams']
    console.log('Params')
    console.log(params)
    const paramsToVerify = {
      to: params.to.toLowerCase(),
      from: params.from.toLowerCase(),
      data: params.data.toLowerCase().substr(0, params.data.length - 130),
      value: params.value.toLowerCase()
    }
    console.log('Params to Verify')
    console.log(paramsToVerify)
    console.log(JSON.stringify(paramsToVerify))
    const h = hashMessage(JSON.stringify(paramsToVerify))
    console.log(h)
    const signature = `0x${params.data.substr(-130)}`
    // signature is 130 chars in length at the end
    console.log(signature)
    const addressToVerify = verifyMessage(h, signature)
    console.log(chainId)
    console.log(addressToVerify)
    let canSubmit = params.to.toLowerCase() === FIRST_PARTY_CONTRACT_NAMES['MetaMask Bridge'][chainId].toLowerCase()?
      addressToVerify.toLowerCase() === TRUSTED_BRIDGE_SIGNER.toLowerCase() : true;
    console.log('Can Submit?')
    console.log(canSubmit)

    return (
      <div
        className={classnames('confirm-page-container-content', {
          'confirm-page-container-content--with-top-border': hasTopBorder,
        })}
      >
        {warning ? <ConfirmPageContainerWarning warning={warning} /> : null}
        {ethGasPriceWarning && (
          <ConfirmPageContainerWarning warning={ethGasPriceWarning} />
        )}
        <ConfirmPageContainerSummary
          className={classnames({
            'confirm-page-container-summary--border': !detailsComponent,
          })}
          action={action}
          image={image}
          titleComponent={titleComponent}
          subtitleComponent={subtitleComponent}
          tokenAddress={tokenAddress}
          nonce={nonce}
          origin={origin}
          toAddress={toAddress}
          transactionType={transactionType}
        />
        {this.renderContent()}
        {!supportsEIP1559 &&
          !showInsuffienctFundsError &&
          !showIsSigningOrSubmittingError &&
          !showUserOpContractDeployError &&
          (errorKey || errorMessage) && (
            <BannerAlert
              severity={Severity.Danger}
              description={errorKey ? t(errorKey) : errorMessage}
              marginBottom={4}
              marginLeft={4}
              marginRight={4}
            />
          )}
        {showInsuffienctFundsError && (
          <BannerAlert
            severity={Severity.Danger}
            marginBottom={4}
            marginLeft={4}
            marginRight={4}
            description={
              isBuyableChain
                ? t('insufficientCurrencyBuyOrDeposit', [
                    nativeCurrency,
                    networkName,
                    ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
                    <Button
                      variant={BUTTON_VARIANT.LINK}
                      size={BUTTON_SIZES.INHERIT}
                      onClick={openBuyCryptoInPdapp}
                      key={`${nativeCurrency}-buy-button`}
                    >
                      {t('buyAsset', [nativeCurrency])}
                    </Button>,
                    ///: END:ONLY_INCLUDE_IF
                  ])
                : t('insufficientCurrencyDeposit', [
                    nativeCurrency,
                    networkName,
                  ])
            }
          />
        )}
        {(showIsSigningOrSubmittingError || showUserOpContractDeployError) && (
          <BannerAlert
            data-testid="confirm-page-container-content-error-banner-2"
            severity={Severity.Danger}
            description={t(errorKey)}
            marginBottom={4}
            marginLeft={4}
            marginRight={4}
          />
        )}
        <PageContainerFooter
          onCancel={onCancel}
          cancelText={cancelText}
          onSubmit={onSubmit}
          submitText={submitText}
          disabled={disabled || !canSubmit}
          submitButtonType={submitButtonType}
        >
          {unapprovedTxCount > 1 ? (
            <a onClick={onCancelAll}>{rejectNText}</a>
          ) : null}
        </PageContainerFooter>
      </div>
    );
  }
}

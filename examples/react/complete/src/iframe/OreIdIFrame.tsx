import { OreId, SignResponse, User } from "oreid-js";
import React from "react";

export interface OreIdIFrameProps {
  oreId: OreId;
  /**
   * auth or sign url. URLs can be obtained using oreid instance's functions
   */
  oreIdUrl: string;
  onSuccess: (data: { user?: User; signedTxn?: any }) => void;
  onError: (errorMessage: string) => void;
  customClassName?: string;
}

const OREID_AUTH_CALLBACK = `/authcallback`;
const OREID_SIGN_CALLBACK = `/signcallback`;

/**
 * Shows an iframe with the oreid url. Handles both auth and sign flows.
 */
function OreIdIFrame({
  oreId,
  oreIdUrl,
  onSuccess,
  onError,
  customClassName,
}: OreIdIFrameProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  return (
    <iframe
      ref={iframeRef}
      title={"Aikon / OreId Iframe"}
      frameBorder={"0"}
      className={customClassName}
      style={{ minHeight: "750px" }}
      onLoad={handleLoad}
      src={oreIdUrl}
    >
      {
        "Your browser doesn't support iframes so authentication flow cannot be initialized."
      }
    </iframe>
  );

  function handleLoad() {
    try {
      /**
       * Try to extract the callback url from iframe after OreID redirects (this triggers onLoad), then extract the query params
       * (this is only possible if the callback url has the same origin as our web app, otherwise we won't be able to access it)
       */
      const iframeCallbackUrl =
        iframeRef.current?.contentWindow?.location?.href;

      if (!iframeCallbackUrl) {
        throw new Error(
          "Callback URL could not be extracted from iframe. Please check callback URL configuration. Callback URL can be cross-origin, or not formatted correctly."
        );
      }

      const callbackURLPathname = new URL(iframeCallbackUrl).pathname;

      if (/authcallback/i.test(iframeCallbackUrl)) {
        handleAuthCallback(iframeCallbackUrl);
      } else if (/signcallback/i.test(iframeCallbackUrl)) {
        handleSignCallback(iframeCallbackUrl);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Handles the txn sign callback from ORE-ID with an txn related parameters indicating that txn was signed successfully
   */
  function handleSignCallback(callbackUrl: string) {
    const { signedTransaction, errors } = oreId.handleSignResponse(callbackUrl);

    if (signedTransaction) {
      onSuccess({
        signedTxn: signedTransaction,
      });
    } else {
      onError(
        errors?.length
          ? `Error while handling sign callback: ${errors.join(" - ")}`
          : "Couldn't get txn data. Unknown error in callback. Please try again."
      );
    }
  }

  /**
   * Handles the authentication callback url  from ORE-ID with an "account" parameter indicating that a user has logged in
   */
  async function handleAuthCallback(callbackUrl: string) {
    const { account: oreAccountId, errors } =
      oreId.handleAuthResponse(callbackUrl);

    if (oreAccountId) {
      try {
        const userInfoFromApi = await oreId.getUserInfoFromApi(oreAccountId);

        if (userInfoFromApi) {
          onSuccess({ user: userInfoFromApi });
        }
      } catch (error) {
        onError((error as any)?.message || "Error loading user from api");
      }
    } else {
      onError(
        errors?.length
          ? `Error while handling auth callback: ${errors.join(" - ")}`
          : "Couldn't get user data. Unknown error in callback. Please try again."
      );
    }
  }
}

export default OreIdIFrame;

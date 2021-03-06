/* eslint react-hooks/exhaustive-deps: 0 */

import React, { useEffect, useState } from "react";
import {
  GoogleLogin,
  useGoogleLogin,
  GoogleLogout,
  useGoogleLogout,
} from "react-google-login";
import { OreId } from "oreid-js";
import logo from "./logo-oreid.svg";
import "./App.css";

// Google Oauth clientId from registering your app with Google
const googleOauthClientId = "571262146536-le7c8genogladg68ubqb5l0f8nijhgr5.apps.googleusercontent.com";

  /** Initialize Ore Id */
  const oreId = new OreId({
    appName: "ORE ID - Google OAuth Sample App",
    appId: "demo_0097ed83e0a54e679ca46d082ee0e33a",
    apiKey: "demo_k_97b33a2f8c984fb5b119567ca19e4a49",
    oreIdUrl: "http://localahost:8080",
    isUsingProxyServer: true,
  });

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  // load user on startup
  useEffect(() => {
    fetchOreIdUser();
  }, []);

  const onLoginSuccess = (e) => {
    setLoggedIn(true);
    console.log('Successful Login, ')

    fetchOreIdUser().then(() => {
      const googleUser = { ...e?.profileObj, idToken: e?.tokenId };
      console.log(googleUser);
      let loginOutput = loginToOreId(googleUser.googleId);
      console.log(loginOutput);
    });
  };

  const onLogoutSuccess = (e) => {
    setLoggedIn(false);
    oreId.logout(); // clears ORE ID accessToken
  };

  const onFailure = (e) => {
    console.error(e);
  };

  const googleOauthProps = {
    clientId: googleOauthClientId,
    buttonText: "hello",
    onFailure,
  };

  useGoogleLogin({ ...googleOauthProps, onSuccess: onLoginSuccess });
  useGoogleLogout({ ...googleOauthProps, onLogoutSuccess });

  /** Load the user from local storage - user info is automatically saved to local storage by oreId.getUserInfoFromApi() */
  const fetchOreIdUser = async () => {
    let userInfo = (await oreId.getUser()) || {};
    if (userInfo?.accountName) {
      if (userInfo.accountName) setUser({ ...userInfo });
      setLoggedIn(true);
    }
  };

  //** Convert Google IdToken to ORE ID accessToken */
  const loginToOreId = (idToken) => {
    console.log(idToken);
    let loginOutputOreId = oreId.login({ idToken }).then(({ accessToken }) => {
      oreId.accessToken = accessToken; // saves accessToken in local storage
      fetchOreIdUser();
    });
    console.log(loginOutputOreId);
  };

  const renderLoggedIn = () => {
    const { accountName, email, name, picture, username } = user;
    return (
      <div>
        <div className="google-logout-button">
          <GoogleLogout {...{ ...googleOauthProps, onLogoutSuccess }} />
        </div>
        <div style={{ marginTop: 40 }}>
          <h4>User Info</h4>
          <img src={picture} alt="user" />
          <br />
          OreId account: {accountName}
          <br />
          name: {name}
          <br />
          username: {username}
          <br />
          email: {email}
          <br />
        </div>
      </div>
    );
  };

  const renderLoggedOut = () => {
    return (
      <div>
        {!loggedIn && (
          <div className="google-login-button">
            <GoogleLogin {...{ ...googleOauthProps, onSuccess: onLoginSuccess }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="ORE ID" />
        {loggedIn ? (
          <div>{renderLoggedIn()} </div>
        ) : (
          <div>{renderLoggedOut()} </div>
        )}
      </header>
    </div>
  );
}

export default App;

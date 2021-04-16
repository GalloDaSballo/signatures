import { SigningKey } from "@ethersproject/signing-key";
import Head from "next/head";
import { useMemo, useState } from "react";
import aes256 from "aes256";
import { useLogin, useUser } from "../context/UserContext";
import styles from "../styles/Home.module.css";

const Home: React.FC = () => {
  const user = useUser();
  const login = useLogin();
  const [pkA, setPkA] = useState<string | null>(null);
  const [pkB, setPkB] = useState<string | null>(null);

  const message = "Hey B, how are you?";

  const signingKeyA = useMemo(() => {
    return pkA ? new SigningKey(pkA) : null;
  }, [pkA]);

  const signingKeyB = useMemo(() => {
    return pkB ? new SigningKey(pkB) : null;
  }, [pkB]);

  const sharedSignKey = useMemo(() => {
    return signingKeyB
      ? signingKeyB.computeSharedSecret(signingKeyA.publicKey) // Equivalent to signingKeyA.computeSharedSecret(signingKeyB.publicKey)
      : null;
  }, [signingKeyA, signingKeyB]);

  const signedByA = useMemo(() => {
    return sharedSignKey ? aes256.encrypt(sharedSignKey, message) : null;
  }, [sharedSignKey]);

  const readByB = useMemo(() => {
    return signedByA ? aes256.decrypt(sharedSignKey, signedByA) : null;
  }, [sharedSignKey, signedByA]);

  const firstSignature = async () => {
    const signer = user.provider.getSigner();
    const sign = await signer.signMessage("SignA");
    setPkA(sign);
  };

  const secondSignature = async () => {
    const signer = user.provider.getSigner();
    const sign = await signer.signMessage("SignB");
    setPkB(sign);
  };

  if (!user) {
    return (
      <div>
        Login Please
        <button type="button" onClick={(e) => login()}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h2>Using Signatures as secret keys</h2>
        <pre>{pkA}</pre>
        <button type="button" onClick={firstSignature}>
          First Signature
        </button>
        <pre>{pkB}</pre>
        <button type="button" onClick={secondSignature}>
          Second Signature
        </button>

        {signingKeyA && signingKeyB && (
          <div>
            <h2>Key A</h2>
            <h3>Public Key</h3>
            <pre>{signingKeyA.publicKey}</pre>
            <h3>Private Key</h3>
            <pre>{signingKeyA.privateKey}</pre>

            <h2>Key B</h2>
            <h3>Public Key</h3>
            <pre>{signingKeyB.publicKey}</pre>
            <h3>Private Key</h3>
            <pre>{signingKeyB.privateKey}</pre>

            <h2>Shared Secret</h2>
            <h3>From A</h3>
            <pre>{signingKeyA.computeSharedSecret(signingKeyB.publicKey)}</pre>
            <h3>From B</h3>
            <pre>{signingKeyB.computeSharedSecret(signingKeyA.publicKey)}</pre>

            <h2>Shared sign key</h2>
            <pre>{sharedSignKey}</pre>

            <h2>A sends a message to B</h2>
            <pre>{message}</pre>

            <h2>A signs it with AES256 with shared secret Version</h2>
            <pre>{signedByA}</pre>

            <h2>B Reads it with AES256 with shared secret</h2>
            <pre>{readByB}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

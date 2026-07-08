import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleProvider({ 
  children 
}) {

  // return <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
  return <GoogleOAuthProvider clientId={"345351438622-9542via083b4khipgij4uafng9hf9jdc.apps.googleusercontent.com"}>{children}</GoogleOAuthProvider>;
}
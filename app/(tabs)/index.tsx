import { StyleSheet, Text, View } from 'react-native';

import { useLogto } from '@logto/rn';
import { useEffect, useState } from 'react';
import { Button } from 'react-native';

export default function HomeScreen() {

  const { signIn, signOut, isAuthenticated, getIdTokenClaims } = useLogto();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      getIdTokenClaims().then((claims) => {
        setUser(claims); // { sub: '...', ... }
      });
    }
  }, [isAuthenticated, getIdTokenClaims]);

  useEffect(() => {
    if (user) {
      console.log('User claims:', user);
    }
  }
  , [user]);
  return (

    <View style={styles.container}>
      <Text>Home Screen</Text>
      {isAuthenticated ? (
            <Button title="Sign out" onPress={async () => signOut()} />
          ) : (
            // Replace the redirect URI with your own
            <Button
              title="Sign in"
              onPress={async () => {
                if (process.env.EXPO_PUBLIC_LOGTO_CALLBACK) {
                  await signIn(process.env.EXPO_PUBLIC_LOGTO_CALLBACK);
                } else {
                  console.error('LOGTO_CALLBACK is not defined in the environment variables.');
                }
              }}
            />
          )}
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../../config';
import { AuthContext } from '../../Helper/Context';
import { useContext } from 'react';

export const AccountRoute = () => {
  const { loggedIn, setLoggedIn } = useContext(AuthContext);
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.container}>
      <Avatar.Text size={80} label="XD" />
      <Text variant="headlineLarge">Headline Large</Text>
      <Text variant="headlineSmall">Headline Large</Text>
      <Button
        mode="text"
        onPress={() => {
          handleSignOut();
        }}
      >
        Sign Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { useContext, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Appbar, Button, Avatar } from 'react-native-paper';
import { AuthContext } from '../../Helper/Context';
export const HomeRoute = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <>
      <Appbar.Header>
        <Appbar.Action
          icon={() => (
            <Avatar.Text
              size={25}
              label={currentUser?.displayName?.slice(0, 1)}
            />
          )}
        />
        <Appbar.Content
          title={<Text variant="titleMedium">{currentUser?.displayName}</Text>}
        />
      </Appbar.Header>
      <View>
        <Text>HomeRoute</Text>
        <Text>{currentUser?.email}</Text>
        <Button mode="text" onPress={() => {}}>
          Search
        </Button>
      </View>
    </>
  );
};

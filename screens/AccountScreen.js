import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { Appbar, Avatar, List, Text } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../config';
import { AppContext } from '../Helper/Context';
import { useContext } from 'react';
import { hexToRgba } from '../Helper/FormatFunctions';

const AccountScreen = () => {
  const { userAccount, accounts } = useContext(AppContext);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: '#FFFFFF',
        }}
      >
        <Appbar.Content
          title={
            <Text variant="labelLarge" style={{ fontSize: 24, lineHeight: 30 }}>
              MY PROFILE
            </Text>
          }
        />
        <Appbar.Action
          icon="logout"
          onPress={() => handleSignOut()}
          style={{
            backgroundColor: '#FF4C38',
            borderRadius: 12,
          }}
          color="#FFFFFF"
        />
      </Appbar.Header>
      <View style={styles.container}>
        <ScrollView>
          <View style={{ paddingHorizontal: '3%' }}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: hexToRgba(userAccount?.profileBackground, 0.1),
                padding: 10,
                marginVertical: 8,
                borderRadius: 12,
              }}
            >
              <Avatar.Text
                size={64}
                label={userAccount?.name?.slice(0, 1)}
                style={{
                  backgroundColor: userAccount?.profileBackground,
                  margin: 5,
                }}
                labelStyle={{ color: '#FFFFFF', top: 1, fontSize: 45 }}
              />
              <Text
                variant="displaySmall"
                style={{ color: '#151940', fontSize: 25 }}
              >
                {userAccount?.name}
              </Text>
              <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                {userAccount?.email}
              </Text>
              <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                {userAccount?.type?.toUpperCase()}
              </Text>
              <Text
                variant="displaySmall"
                style={{
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  textDecorationLine: 'underline',
                }}
              >
                {userAccount?.code}
              </Text>
              <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                Family Code
              </Text>
            </View>
            {accounts &&
              accounts
                ?.filter((account) => account.type !== userAccount.type)
                .map((account) => (
                  <View key={account.uid}>
                    <Text variant="titleLarge" style={{ padding: 10 }}>
                      Linked Account(s)
                    </Text>
                    <List.Item
                      title={account.name}
                      description={account.email}
                      descriptionNumberOfLines={1}
                      descriptionEllipsizeMode="tail"
                      style={{
                        backgroundColor: hexToRgba(
                          account.profileBackground,
                          0.1
                        ),
                        borderRadius: 12,
                        margin: 5,
                      }}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={() => (
                            <Avatar.Icon
                              size={45}
                              icon="account"
                              color="#FFFFFF"
                              style={{
                                backgroundColor: account.profileBackground,
                              }}
                            />
                          )}
                        />
                      )}
                      right={(props) => (
                        <View
                          style={{
                            backgroundColor: '#FFFFFF',
                            width: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 12,
                          }}
                        >
                          {account.type === 'provider' ? (
                            <Text
                              variant="labelLarge"
                              style={{ color: '#FF4C38' }}
                            >
                              P
                            </Text>
                          ) : (
                            <Text
                              variant="labelLarge"
                              style={{ color: '#38B6FF' }}
                            >
                              M
                            </Text>
                          )}
                        </View>
                      )}
                    />
                  </View>
                ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

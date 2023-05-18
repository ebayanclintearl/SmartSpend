// Imports
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { Appbar, Avatar, List, Text } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../config';
import { AppContext } from '../Helper/Context';
import { useContext } from 'react';
import { hexToRgba } from '../Helper/FormatFunctions';

// The AccountScreen component displays the user's account information and linked accounts.
const AccountScreen = () => {
  const { userAccount, accounts } = useContext(AppContext);
  // The handleSignOut function is called when the sign-out button is pressed.
  // It uses the signOut function from the auth module to sign out the user.
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      {/* The component renders a StatusBar component to set the status bar appearance. */}
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      {/* Component to display the header */}
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
      {/* The main content of the screen is wrapped inside a View component with styles.container. */}
      <View style={styles.container}>
        {/* ScrollView that wraps the content to enable scrolling. */}
        <ScrollView>
          <View style={{ paddingHorizontal: '3%' }}>
            {/* The user's profile information is displayed in a View component with profile-related 
            data such as the profile background, avatar, name, email, account type, and family code. */}
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
                {userAccount?.accountType?.toUpperCase()}
              </Text>
              <Text
                variant="displaySmall"
                style={{
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  textDecorationLine: 'underline',
                }}
              >
                {userAccount?.familyCode}
              </Text>
              <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                Family Code
              </Text>
            </View>
            {/* Linked accounts are displayed in a List component, where each linked account is rendered as a List.Item component. */}
            {accounts && (
              <View>
                <Text variant="titleLarge" style={{ padding: 10 }}>
                  Linked Accounts
                </Text>
                {accounts
                  ?.filter(
                    (account) => account.accountType !== userAccount.accountType
                  )
                  .map((account) => (
                    <List.Item
                      key={account.uid}
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
                          {account.accountType === 'provider' ? (
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
                  ))}
              </View>
            )}
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

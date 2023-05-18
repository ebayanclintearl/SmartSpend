// Imports
import {
  StyleSheet,
  View,
  TextInput as NativeTextInput,
  StatusBar,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { Appbar, Avatar, List, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { AppContext } from '../Helper/Context';
import { formatCurrency, hexToRgba } from '../Helper/FormatFunctions';

// The SearchScreen component represents the screen where users can search for transactions in their family's expense history.
const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { userAccount, familyCode } = useContext(AppContext);

  // The onChangeSearch function is called whenever the search query changes, updating the searchQuery state.
  const onChangeSearch = (query) => setSearchQuery(query);

  // This code filters the family's expense history based on the user's account type and search query.
  // It returns an array of transactions that match the search query.
  const filteredTransactions = (
    familyCode.familyExpenseHistory &&
    Object.entries(familyCode?.familyExpenseHistory)
  )
    ?.map(([key, transaction]) => {
      return { id: key, ...transaction };
    })
    .filter((transaction) => {
      if (userAccount.accountType === 'provider') {
        return (
          transaction.accountType === 'provider' ||
          transaction.accountType === 'member'
        );
      } else if (userAccount.accountType === 'member') {
        return transaction.uid === userAccount.uid;
      } else {
        return [];
      }
    })
    .filter((transaction) => {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      return (
        transaction.name.toLowerCase().includes(lowerCaseSearchQuery) ||
        transaction.category.title
          .toLowerCase()
          .includes(lowerCaseSearchQuery) ||
        transaction.amount
          .toString()
          .toLowerCase()
          .includes(lowerCaseSearchQuery) ||
        transaction.description
          .toString()
          .toLowerCase()
          .includes(lowerCaseSearchQuery)
      );
    });
  return (
    <>
      {/* The component renders a StatusBar component to set the status bar appearance. */}
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      {/* Component to display the header */}
      <Appbar.Header style={{ backgroundColor: '#FFFFFF' }}>
        <Appbar.BackAction
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(230, 230, 230, 0.56)',
          }}
          onPress={() => {
            navigation.pop();
          }}
        />
        <Appbar.Content
          title={
            // Input field for searching transactions.
            <TextInput
              autoFocus={true}
              mode="outlined"
              placeholder="Search..."
              value={searchQuery}
              onChangeText={onChangeSearch}
              outlineColor="#F5F6FA"
              outlineStyle={{ borderRadius: 30 }}
              activeOutlineColor={{ color: 'none' }}
              style={{
                marginVertical: 5,
                backgroundColor: '#F5F6FA',
              }}
              render={(props) => (
                <NativeTextInput
                  {...props}
                  returnKeyType="search"
                  keyboardAppearance="dark"
                />
              )}
              right={
                <TextInput.Icon
                  icon="close"
                  iconColor="#7F8192"
                  forceTextInputFocus={false}
                  onPress={() => setSearchQuery('')}
                />
              }
            />
          }
        />
      </Appbar.Header>
      {/* The main content of the screen is wrapped inside a View component with styles.container. */}
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          {/* ScrollView that wraps the content to enable scrolling. */}
          <ScrollView>
            {/* Display each search transaction item as a List.Item */}
            {searchQuery &&
              filteredTransactions?.map((transaction, index) => {
                return (
                  <List.Item
                    key={index}
                    title={transaction.category.title}
                    description={`${transaction.name}\n${transaction.description}`}
                    style={{
                      backgroundColor: hexToRgba(
                        transaction.category.color,
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
                            icon={transaction.category.icon}
                            color="#FFFFFF"
                            style={{
                              backgroundColor: transaction.category.color,
                            }}
                          />
                        )}
                      />
                    )}
                    right={(props) => (
                      <Text
                        {...props}
                        style={{
                          color:
                            transaction.expenseType === 'income'
                              ? '#38B6FF'
                              : '#FF4C38',
                          fontWeight: 'bold',
                          alignSelf: 'center',
                        }}
                      >
                        {formatCurrency(transaction.amount)}
                      </Text>
                    )}
                    onPress={() => {
                      navigation.navigate('DetailScreen', {
                        transactionId: transaction.id,
                      });
                    }}
                  />
                );
              })}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

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

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { userAccount, familyCode } = useContext(AppContext);

  const onChangeSearch = (query) => setSearchQuery(query);

  const filteredTransactions = (
    familyCode.familyExpenseHistory &&
    Object.entries(familyCode?.familyExpenseHistory)
  )
    ?.map(([key, transaction]) => {
      return { id: key, ...transaction };
    })
    .filter((transaction) => {
      if (userAccount.type === 'provider') {
        return (
          transaction.accountType === 'provider' ||
          transaction.accountType === 'member'
        );
      } else if (userAccount.type === 'member') {
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
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
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
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <ScrollView>
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
                            transaction.type === 'income'
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

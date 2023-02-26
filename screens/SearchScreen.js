import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { Appbar, List, Searchbar, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { AccountContext } from '../Helper/Context';

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { accountInfo, accountsInfo } = useContext(AccountContext);
  const onChangeSearch = (query) => setSearchQuery(query);

  const filteredTransactions = (
    accountsInfo.transactions && Object.entries(accountsInfo?.transactions)
  )
    ?.map(([key, transaction]) => {
      return { id: key, ...transaction };
    })
    .filter((transaction) => {
      if (accountInfo.type === 'provider') {
        return (
          transaction.accountType === 'provider' ||
          transaction.accountType === 'member'
        );
      } else if (accountInfo.type === 'member') {
        return transaction.accountType === 'member';
      } else {
        return true;
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
      <Appbar.Header>
        <Appbar.Content
          title={
            <Searchbar
              placeholder="Search..."
              onChangeText={onChangeSearch}
              value={searchQuery}
              elevation={0}
            />
          }
        />
        <Appbar.Action
          icon={'close'}
          onPress={() => {
            navigation.pop();
          }}
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
                    left={(props) => (
                      <List.Icon {...props} icon={transaction.category.icon} />
                    )}
                    right={(props) => (
                      <Text
                        {...props}
                        style={{
                          color:
                            transaction.type === 'income' ? 'green' : 'red',
                          fontWeight: 'bold',
                          alignSelf: 'center',
                        }}
                      >
                        {transaction.amount}
                      </Text>
                    )}
                    onPress={() => {
                      navigation.navigate('TransactionDetailScreen', {
                        transactionID: transaction.id,
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
  },
});

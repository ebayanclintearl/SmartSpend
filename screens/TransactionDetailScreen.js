import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { AccountContext, AppContext } from '../Helper/Context';
import { Appbar, Button, Text } from 'react-native-paper';
import { formatCurrency, formatDateAndTime } from '../Helper/FormatFunctions';
import { useNavigation } from '@react-navigation/native';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config';

const TransactionDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { transactionId } = route.params;
  const { userAccount, familyCode } = useContext(AppContext);
  const transactionInfo = familyCode?.familyExpenseHistory[transactionId];
  const [accountName, setAccountName] = useState(transactionInfo?.name);
  const [date, setDate] = useState(transactionInfo?.date);
  const [amount, setAmount] = useState(transactionInfo?.amount);
  const [description, setDescription] = useState(transactionInfo?.description);
  const [category, setCategory] = useState(transactionInfo?.category?.title);
  const handleRemove = async () => {
    const docRef = doc(db, 'familyCodes', userAccount?.code.toString());
    await updateDoc(docRef, {
      ['familyExpenseHistory.' + transactionId]: deleteField(),
    });
    navigation.pop();
  };
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.pop();
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <Text>Name {accountName}</Text>
        <Text>Transaction Date {formatDateAndTime(date.toDate())}</Text>
        <Text>Amount {amount}</Text>
        <Text>Description {description}</Text>
        <Text>Category {category}</Text>
        <Button mode="contained" onPress={() => handleRemove()}>
          Remove
        </Button>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate('TransactionScreen', {
              transactionId: transactionId,
            })
          }
        >
          Edit
        </Button>
      </View>
    </>
  );
};

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
